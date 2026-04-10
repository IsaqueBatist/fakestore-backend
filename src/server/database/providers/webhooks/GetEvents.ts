import { EtableNames } from "../../ETableNames";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

interface IGetEventsFilter {
  status?: string;
  event_type?: string;
  date_from?: string;
  date_to?: string;
  page: number;
  limit: number;
}

export const getEvents = async (
  trx: KnexType.Transaction,
  filter: IGetEventsFilter,
): Promise<{ data: unknown[]; total: number }> => {
  try {
    const query = trx(EtableNames.webhook_events);

    if (filter.status) {
      query.where("status", filter.status);
    }
    if (filter.event_type) {
      query.where("event_type", filter.event_type);
    }
    if (filter.date_from) {
      query.where("created_at", ">=", filter.date_from);
    }
    if (filter.date_to) {
      query.where("created_at", "<=", filter.date_to);
    }

    const countQuery = query.clone().count("* as total").first();
    const total = Number((await countQuery)?.total || 0);

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
      resource: "webhook events",
    });
  }
};
