import { RequestHandler } from "express";
import { RedisService } from "../services/RedisService";

const LOG_QUEUE_KEY = "queue:api_logs";
const MAX_BODY_SIZE = 4096; // 4KB

function truncateBody(body: unknown): unknown {
  if (!body) return null;
  const str = JSON.stringify(body);
  if (str.length <= MAX_BODY_SIZE) return body;
  return { _truncated: true, _size: str.length };
}

// Paths to skip logging
const SKIP_PATHS = ["/health", "/api-docs", "/favicon.ico"];

export const requestLogger: RequestHandler = (req, res, next) => {
  if (SKIP_PATHS.some((p) => req.path.startsWith(p))) {
    return next();
  }

  const start = Date.now();
  const originalJson = res.json;

  // Intercept res.json() to capture response body
  res.json = function (body: unknown) {
    res.locals._responseBody = body;
    return originalJson.call(this, body);
  };

  res.on("finish", () => {
    const tenantId = req.tenant?.id;
    if (!tenantId) return; // Skip if no tenant resolved

    const logData = {
      tenant_id: tenantId,
      user_id: req.user?.id || null,
      method: req.method,
      path: req.path,
      status_code: res.statusCode,
      duration_ms: Date.now() - start,
      request_body: truncateBody(req.body),
      response_body: truncateBody(res.locals._responseBody),
      ip_address: req.ip || null,
    };

    // Fire-and-forget: push to Redis queue for batch processing
    RedisService.lpush(LOG_QUEUE_KEY, JSON.stringify(logData)).catch(
      () => {},
    );
  });

  next();
};
