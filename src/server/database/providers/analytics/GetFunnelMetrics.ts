import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";
import { EtableNames } from "../../ETableNames";

interface IFunnelEntry {
  status: string;
  count: number;
}

export const getFunnelMetrics = async (
  trx: KnexType.Transaction,
): Promise<IFunnelEntry[]> => {
  try {
    const result = (await trx(EtableNames.orders)
      .select("status")
      .count("* as count")
      .groupBy("status")
      .orderByRaw(
        "CASE status " +
          "WHEN 'pending' THEN 1 " +
          "WHEN 'awaiting_payment' THEN 2 " +
          "WHEN 'paid' THEN 3 " +
          "WHEN 'shipped' THEN 4 " +
          "WHEN 'delivered' THEN 5 " +
          "WHEN 'cancelled' THEN 6 " +
          "ELSE 7 END",
      )) as { status: string; count: string }[];

    return result.map((r) => ({
      status: r.status,
      count: Number(r.count),
    }));
  } catch (error) {
    logger.error({ err: error }, "Failed to get funnel metrics");
    throw new DatabaseError("errors:db_error_fetching", {
      resource: "funnel metrics",
    });
  }
};
