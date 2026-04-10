import { AnalyticsProvider } from "../../database/providers/analytics";
import { RedisService } from "../../shared/services/RedisService";
import type { Knex as KnexType } from "knex";

const CACHE_TTL = 300; // 5 minutes

export const getFunnel = async (
  trx: KnexType.Transaction,
  tenantId: number,
): Promise<{ status: string; count: number }[]> => {
  const cacheKey = `metrics:funnel:${tenantId}`;

  const cached =
    await RedisService.get<{ status: string; count: number }[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const funnel = await AnalyticsProvider.getFunnelMetrics(trx);

  await RedisService.set(cacheKey, funnel, CACHE_TTL);

  return funnel;
};
