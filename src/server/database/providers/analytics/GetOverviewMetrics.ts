import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";
import { EtableNames } from "../../ETableNames";

interface IOverviewMetrics {
  order_count: number;
  revenue: number;
  avg_ticket: number;
}

export const getOverviewMetrics = async (
  trx: KnexType.Transaction,
  dateFrom: string,
  dateTo: string,
): Promise<IOverviewMetrics> => {
  try {
    const result = (await trx(EtableNames.orders)
      .where("created_at", ">=", dateFrom)
      .where("created_at", "<=", dateTo)
      .select(
        trx.raw("COUNT(*)::int as order_count"),
        trx.raw("COALESCE(SUM(total), 0)::numeric as revenue"),
        trx.raw("COALESCE(AVG(total), 0)::numeric as avg_ticket"),
      )
      .first()) as { order_count: number; revenue: string; avg_ticket: string } | undefined;

    return {
      order_count: result?.order_count || 0,
      revenue: Number(result?.revenue || 0),
      avg_ticket: Number(result?.avg_ticket || 0),
    };
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_fetching", {
      resource: "overview metrics",
    });
  }
};
