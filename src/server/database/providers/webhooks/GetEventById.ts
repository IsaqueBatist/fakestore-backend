import { EtableNames } from "../../ETableNames";
import { DatabaseError } from "../../../errors";
import type { IWebhookEvent } from "../../models";
import type { Knex as KnexType } from "knex";

export const getEventById = async (
  trx: KnexType.Transaction,
  eventId: number,
): Promise<IWebhookEvent | undefined> => {
  try {
    return await trx(EtableNames.webhook_events)
      .where("id_event", eventId)
      .first();
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_fetching", {
      resource: "webhook event",
    });
  }
};
