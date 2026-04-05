import { OrderProvider } from "../../database/providers/orders";
import { IOrder } from "../../database/models";
import { dispatchWebhook } from "../../shared/services/WebhookService";
import type { Knex } from "knex";

export const updateByUserId = async (
  trx: Knex.Transaction,
  tenantId: number,
  orderId: number,
  newOrder: Omit<IOrder, "id_order" | "created_at">,
): Promise<void> => {
  await OrderProvider.updateByUserId(orderId, newOrder, trx);

  // Fire webhook on status change
  if (newOrder.status) {
    dispatchWebhook(tenantId, "order.status_changed", {
      order_id: orderId,
      new_status: newOrder.status,
    }).catch(() => {});
  }
};
