import { OrderProvider } from "../../database/providers/orders";
import { EOrderStatus } from "../../database/models/OrderStatus";
import {
  validateTransition,
  getWebhookEvent,
} from "../../shared/services/OrderStateMachine";
import type { PendingWebhook } from "../../../@types/express";
import type { Knex } from "knex";

export const confirmPayment = async (
  trx: Knex.Transaction,
  tenantId: number,
  orderId: number,
  pendingWebhooks: PendingWebhook[],
): Promise<{ order_id: number; status: string }> => {
  // getById already uses FOR UPDATE, serializing concurrent confirmations
  const order = await OrderProvider.getById(orderId, undefined, trx);
  const currentStatus = order.status as EOrderStatus;

  // Backward compat: PENDING -> PAID via atomic two-step transition
  // State machine requires PENDING -> AWAITING_PAYMENT -> PAID
  if (currentStatus === EOrderStatus.PENDING) {
    validateTransition(currentStatus, EOrderStatus.AWAITING_PAYMENT);
    await OrderProvider.updateStatus(
      orderId,
      tenantId,
      EOrderStatus.AWAITING_PAYMENT,
      trx,
    );

    const awaitingEvent = getWebhookEvent(EOrderStatus.AWAITING_PAYMENT);
    if (awaitingEvent) {
      pendingWebhooks.push({
        tenantId,
        event: awaitingEvent,
        payload: { order_id: order.id_order, user_id: order.user_id },
      });
    }

    // Now transition AWAITING_PAYMENT -> PAID
    validateTransition(EOrderStatus.AWAITING_PAYMENT, EOrderStatus.PAID);
  } else {
    // Direct transition (e.g., AWAITING_PAYMENT -> PAID)
    validateTransition(currentStatus, EOrderStatus.PAID);
  }

  await OrderProvider.updateStatus(orderId, tenantId, EOrderStatus.PAID, trx);

  pendingWebhooks.push({
    tenantId,
    event: getWebhookEvent(EOrderStatus.PAID)!,
    payload: {
      order_id: order.id_order,
      user_id: order.user_id,
      total: order.total,
    },
  });

  return { order_id: orderId, status: EOrderStatus.PAID };
};
