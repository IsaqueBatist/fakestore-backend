import { WebhookEventProvider } from "../../database/providers/webhooks";
import type { Knex as KnexType } from "knex";

interface IListEventsParams {
  trx: KnexType.Transaction;
  status?: string;
  event_type?: string;
  date_from?: string;
  date_to?: string;
  page: number;
  limit: number;
}

export const listEvents = async (
  params: IListEventsParams,
): Promise<{ data: unknown[]; total: number; page: number; limit: number }> => {
  const { trx, ...filter } = params;

  const result = await WebhookEventProvider.getEvents(trx, filter);

  return {
    data: result.data,
    total: result.total,
    page: filter.page,
    limit: filter.limit,
  };
};
