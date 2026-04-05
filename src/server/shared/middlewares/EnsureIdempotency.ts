import { Request, Response, NextFunction } from "express";
import { Knex as KnexInstance } from "../../database/knex";
import { EtableNames } from "../../database/ETableNames";
import { BadRequestError } from "../../errors";

/**
 * Idempotency middleware for mutation operations.
 *
 * Requires an `Idempotency-Key` header on POST requests.
 * If the key has been seen before for this tenant, returns the cached response.
 * Otherwise, captures the response and stores it for future deduplication.
 *
 * Keys expire after 24 hours (cleanup should be handled by a scheduled job).
 */
export const ensureIdempotency = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const idempotencyKey = req.headers["idempotency-key"] as string | undefined;

  if (!idempotencyKey) {
    throw new BadRequestError("errors:missing_idempotency_key");
  }

  if (!req.tenant) {
    return next();
  }

  const tenantId = req.tenant.id;

  // Check if this key has been used before
  const existing = await KnexInstance(EtableNames.idempotency_keys)
    .where("tenant_id", tenantId)
    .where("idempotency_key", idempotencyKey)
    .first();

  if (existing) {
    // Return the cached response (short-circuit)
    return res
      .status(existing.response_code)
      .json(JSON.parse(existing.response_body));
  }

  // Capture the response to store it
  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    // Store the response for future deduplication (fire-and-forget)
    KnexInstance(EtableNames.idempotency_keys)
      .insert({
        tenant_id: tenantId,
        idempotency_key: idempotencyKey,
        response_code: res.statusCode,
        response_body: JSON.stringify(body),
      })
      .catch(() => {
        // Idempotency key storage failure is non-fatal
      });

    return originalJson(body);
  };

  return next();
};
