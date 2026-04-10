import crypto from "crypto";
import { WebhookEventProvider } from "../../database/providers/webhooks";
import { dispatchWebhook } from "../../shared/services/WebhookService";
import { NotFoundError, ConflictError } from "../../errors";
import { EtableNames } from "../../database/ETableNames";
import type { Knex as KnexType } from "knex";

export const replayEvent = async (
  trx: KnexType.Transaction,
  tenantId: number,
  eventId: number,
): Promise<{ message: string; delivery_id: string }> => {
  const event = await WebhookEventProvider.getEventById(trx, eventId);

  if (!event) {
    throw new NotFoundError("errors:not_found", {
      resource: "webhook event",
    });
  }

  if (event.status !== "failed" && event.status !== "pending") {
    throw new ConflictError("errors:invalid_webhook_replay_status", {
      current: event.status,
    });
  }

  // Generate idempotent delivery ID for replay
  const deliveryId = crypto.randomUUID();

  // Reset event status for retry
  await trx(EtableNames.webhook_events)
    .where("id_event", eventId)
    .update({
      status: "pending",
      attempts: 0,
      last_attempt_at: null,
    });

  // Re-enqueue to BullMQ with delivery ID
  const payload = JSON.parse(event.payload);
  await dispatchWebhook(tenantId, event.event_type, payload, deliveryId);

  return {
    message: "Event re-enqueued for delivery",
    delivery_id: deliveryId,
  };
};
