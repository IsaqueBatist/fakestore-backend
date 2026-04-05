import { RequestHandler } from "express";
import { RedisService } from "../services/RedisService";

/**
 * Per-tenant rate limiter using Redis sorted sets (sliding window algorithm).
 *
 * Limits are based on the tenant's plan:
 * - Sandbox: 2 req/s
 * - Basic: 10 req/s
 * - Agency: 50 req/s
 *
 * Returns HTTP 429 with standard rate limit headers when exceeded.
 */
export const tenantRateLimiter: RequestHandler = async (req, res, next) => {
  if (!req.tenant) {
    return next();
  }

  const key = `ratelimit:${req.tenant.id}`;
  const now = Date.now();
  const windowMs = 1000; // 1 second sliding window
  const limit = req.tenant.rateLimit;

  try {
    // Sliding window: remove old entries, add current, count total
    const result = await RedisService.rateLimitCheck(key, now, windowMs);

    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - result));

    if (result > limit) {
      res.setHeader("Retry-After", "1");
      res.setHeader("X-RateLimit-Remaining", "0");
      return res.status(429).json({
        errors: { default: req.t("common:too_many_requests") },
      });
    }
  } catch {
    // Rate limit check failure is non-fatal -- allow request through
  }

  return next();
};
