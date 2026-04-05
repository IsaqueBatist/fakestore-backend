import { OrderProvider } from "../../database/providers/orders";
import { EOrderStatus } from "../../database/models/OrderStatus";
import { ConflictError } from "../../errors";
import { dispatchWebhook } from "../../shared/services/WebhookService";
import type { Knex } from "knex";

export const confirmPayment = async (
  trx: Knex.Transaction,
  tenantId: number,
  orderId: number,
): Promise<{ order_id: number; status: string }> => {
  const order = await OrderProvider.getById(orderId, undefined, trx);

  if (order.status !== EOrderStatus.PENDING) {
    throw new ConflictError("errors:invalid_order_status", {
      current: order.status,
      target: EOrderStatus.PAID,
    });
  }

  await OrderProvider.updateStatus(orderId, tenantId, EOrderStatus.PAID, trx);

  dispatchWebhook(tenantId, "order.paid", {
    order_id: order.id_order,
    user_id: order.user_id,
    total: order.total,
  }).catch(() => {});

  return { order_id: orderId, status: EOrderStatus.PAID };
};
