import { logger } from "../../shared/services/Logger";
import { BadRequestError } from "../../errors/BadRequestError";
import { RedisService } from "../../shared/services/RedisService";

const MELHOR_ENVIO_API_URL = "https://melhorenvio.com.br/api/v2/me";
const TIMEOUT_MS = 4000; // 4s max — prevents Node.js socket exhaustion
const CACHE_TTL = 1800; // 30 minutes

export interface ShippingQuoteParams {
  from_postal_code: string;
  to_postal_code: string;
  weight: number; // kg
  height: number; // cm
  width: number; // cm
  length: number; // cm
  insurance_value_cents: number;
}

export interface ShippingQuote {
  carrier: string;
  service: string;
  price_cents: number;
  delivery_days: number;
  error?: string;
}

export interface TrackingInfo {
  code: string;
  status: string;
  events: Array<{
    date: string;
    description: string;
    location?: string;
  }>;
}

function buildCacheKey(params: ShippingQuoteParams): string {
  return `shipping:quote:${params.from_postal_code}:${params.to_postal_code}:${params.weight}:${params.height}x${params.width}x${params.length}`;
}

/**
 * Quote shipping rates via Melhor Envio API.
 * Uses AbortController with 4s timeout to prevent socket exhaustion.
 * Caches results in Redis (30min TTL) for identical origin+destination+dimensions.
 */
export async function quoteShipping(
  params: ShippingQuoteParams,
): Promise<ShippingQuote[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) {
    throw new BadRequestError("shipping:not_configured");
  }

  // Check cache first
  const cacheKey = buildCacheKey(params);
  try {
    const cached = await RedisService.get<ShippingQuote[]>(cacheKey);
    if (cached) {
      logger.info({ cacheKey }, "Shipping quote cache hit");
      return cached;
    }
  } catch {
    // Cache miss is fine, continue to API
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${MELHOR_ENVIO_API_URL}/shipment/calculate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "FakeStore BaaS (contato@fakestore.com.br)",
      },
      body: JSON.stringify({
        from: { postal_code: params.from_postal_code },
        to: { postal_code: params.to_postal_code },
        package: {
          weight: params.weight,
          height: params.height,
          width: params.width,
          length: params.length,
        },
        options: {
          insurance_value: params.insurance_value_cents / 100,
          receipt: false,
          own_hand: false,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        { status: response.status, body: errorText },
        "Melhor Envio API error",
      );
      throw new BadRequestError("shipping:api_error");
    }

    const data = (await response.json()) as Array<{
      name: string;
      company: { name: string };
      price: string;
      delivery_time: number;
      error?: string;
    }>;

    const quotes: ShippingQuote[] = data
      .filter((item) => !item.error)
      .map((item) => ({
        carrier: item.company.name,
        service: item.name,
        price_cents: Math.round(parseFloat(item.price) * 100),
        delivery_days: item.delivery_time,
      }));

    // Cache successful results
    try {
      await RedisService.set(cacheKey, quotes, CACHE_TTL);
    } catch {
      // Non-fatal: cache write failure shouldn't block response
    }

    logger.info(
      { from: params.from_postal_code, to: params.to_postal_code, results: quotes.length },
      "Shipping quote completed",
    );

    return quotes;
  } catch (err: any) {
    if (err.name === "AbortError") {
      logger.error({ params }, "Melhor Envio API timeout (4s)");
      throw new BadRequestError("shipping:timeout");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Track shipment via Melhor Envio API.
 */
export async function trackShipment(
  trackingCode: string,
): Promise<TrackingInfo> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) {
    throw new BadRequestError("shipping:not_configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${MELHOR_ENVIO_API_URL}/shipment/tracking`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "FakeStore BaaS (contato@fakestore.com.br)",
      },
      body: JSON.stringify({ orders: [{ id: trackingCode }] }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new BadRequestError("shipping:tracking_error");
    }

    const data = (await response.json()) as Record<
      string,
      {
        status: string;
        tracking: Array<{
          date: string;
          description: string;
          locale?: string;
        }>;
      }
    >;

    const tracking = data[trackingCode];
    if (!tracking) {
      throw new BadRequestError("shipping:tracking_not_found");
    }

    return {
      code: trackingCode,
      status: tracking.status,
      events: tracking.tracking.map((t) => ({
        date: t.date,
        description: t.description,
        location: t.locale,
      })),
    };
  } catch (err: any) {
    if (err.name === "AbortError") {
      logger.error({ trackingCode }, "Melhor Envio tracking timeout (4s)");
      throw new BadRequestError("shipping:timeout");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
