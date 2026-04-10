import { AnalyticsProvider } from "../../database/providers/analytics";
import { RedisService } from "../../shared/services/RedisService";
import type { Knex as KnexType } from "knex";

const CACHE_TTL = 300; // 5 minutes

function getDateRange(period: string): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const dateTo = now.toISOString();

  let daysBack = 30;
  if (period === "7d") daysBack = 7;
  else if (period === "90d") daysBack = 90;

  const from = new Date(now);
  from.setDate(from.getDate() - daysBack);
  const dateFrom = from.toISOString();

  return { dateFrom, dateTo };
}

export const getOverview = async (
  trx: KnexType.Transaction,
  tenantId: number,
  period: string,
): Promise<{
  order_count: number;
  revenue: number;
  avg_ticket: number;
  period: string;
}> => {
  const cacheKey = `metrics:overview:${tenantId}:${period}`;

  const cached = await RedisService.get<{
    order_count: number;
    revenue: number;
    avg_ticket: number;
  }>(cacheKey);

  if (cached) {
    return { ...cached, period };
  }

  const { dateFrom, dateTo } = getDateRange(period);
  const metrics = await AnalyticsProvider.getOverviewMetrics(
    trx,
    dateFrom,
    dateTo,
  );

  await RedisService.set(cacheKey, metrics, CACHE_TTL);

  return { ...metrics, period };
};
