import { EtableNames } from "../../ETableNames";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

interface IGetLogsFilter {
  method?: string;
  path?: string;
  status_code?: number;
  date_from?: string;
  date_to?: string;
  page: number;
  limit: number;
}

export const getLogs = async (
  trx: KnexType.Transaction,
  filter: IGetLogsFilter,
): Promise<{ data: unknown[]; total: number }> => {
  try {
    const query = trx(EtableNames.api_request_logs);

    if (filter.method) {
      query.where("method", filter.method.toUpperCase());
    }
    if (filter.path) {
      query.where("path", "like", `%${filter.path}%`);
    }
    if (filter.status_code) {
      query.where("status_code", filter.status_code);
    }
    if (filter.date_from) {
      query.where("created_at", ">=", filter.date_from);
    }
    if (filter.date_to) {
      query.where("created_at", "<=", filter.date_to);
    }

    const countResult = await query.clone().count("* as total").first();
    const total = Number(countResult?.total || 0);

    const offset = (filter.page - 1) * filter.limit;
    const data = await query
      .clone()
      .select("*")
      .orderBy("created_at", "desc")
      .limit(filter.limit)
      .offset(offset);

    return { data, total };
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_fetching", {
      resource: "api request logs",
    });
  }
};
