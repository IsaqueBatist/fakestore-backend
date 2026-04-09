import { OrderProvider } from "../../database/providers/orders";
import { IOrder } from "../../database/models";
import type { PendingWebhook } from "../../../@types/express";
import type { Knex } from "knex";

export const updateByUserId = async (
  trx: Knex.Transaction,
  tenantId: number,
  orderId: number,
  newOrder: Omit<IOrder, "id_order" | "created_at">,
  pendingWebhooks: PendingWebhook[],
): Promise<void> => {
  await OrderProvider.updateByUserId(orderId, newOrder, trx);

  // Queue webhook for post-commit dispatch on status change
  if (newOrder.status) {
    pendingWebhooks.push({
      tenantId,
      event: "order.status_changed",
      payload: {
        order_id: orderId,
        new_status: newOrder.status,
      },
    });
  }
};
