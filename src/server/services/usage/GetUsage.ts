import { RedisService } from "../../shared/services/RedisService";

interface IUsageResult {
  today: { count: number };
  current_window: { count: number; limit: number; window_ms: number };
  plan: string;
  rate_limit: number;
  percentage_used_today: number;
}

export const getUsage = async (
  tenantId: number,
  plan: string,
  rateLimit: number,
): Promise<IUsageResult> => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const dailyKey = `usage:daily:${tenantId}:${today}`;
  const windowKey = `ratelimit:${tenantId}`;

  // INCR stores raw integers -- JSON.parse("123") returns 123, so get<number> works
  const [dailyCount, windowCount] = await Promise.all([
    RedisService.get<number>(dailyKey).then((v) => v || 0),
    RedisService.zcard(windowKey),
  ]);

  // Max daily theoretical limit: rate_limit * 86400 seconds
  const maxDaily = rateLimit * 86400;
  const percentageUsed =
    maxDaily > 0
      ? Math.round((dailyCount / maxDaily) * 10000) / 100
      : 0;

  return {
    today: { count: dailyCount },
    current_window: { count: windowCount, limit: rateLimit, window_ms: 1000 },
    plan,
    rate_limit: rateLimit,
    percentage_used_today: percentageUsed,
  };
};
