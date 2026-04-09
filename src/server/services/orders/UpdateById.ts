import { OrderProvider } from "../../database/providers/orders";
import { ProductProvider } from "../../database/providers/products";
import { IOrder } from "../../database/models";
import { EOrderStatus } from "../../database/models/OrderStatus";
import { validateTransition, getWebhookEvent } from "../../shared/services/OrderStateMachine";
import type { PendingWebhook } from "../../../@types/express";
import type { Knex } from "knex";

export const updateByUserId = async (
  trx: Knex.Transaction,
  tenantId: number,
  orderId: number,
  newOrder: Omit<IOrder, "id_order" | "created_at">,
  pendingWebhooks: PendingWebhook[],
): Promise<void> => {
  if (newOrder.status) {
    // Fetch order with FOR UPDATE lock (getById already uses .forUpdate())
    // This serializes concurrent requests, preventing double-refund on cancellation
    const currentOrder = await OrderProvider.getById(orderId, undefined, trx);
    const currentStatus = currentOrder.status as EOrderStatus;
    const targetStatus = newOrder.status as EOrderStatus;

    // Idempotent: if already in target status, return silently
    if (currentStatus === targetStatus) return;

    // Validate state transition (throws ConflictError if invalid)
    validateTransition(currentStatus, targetStatus);

    // Restore stock on cancellation (uses IncrementStock from Sprint 1)
    if (targetStatus === EOrderStatus.CANCELLED) {
      const items = await OrderProvider.getItems(orderId, trx);
      if (items.length > 0) {
        await ProductProvider.incrementStock(
          items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
          trx,
        );
      }
    }

    // Update order status
    await OrderProvider.updateStatus(orderId, tenantId, targetStatus, trx);

    // Queue specific webhook event for post-commit dispatch
    const webhookEvent = getWebhookEvent(targetStatus);
    if (webhookEvent) {
      pendingWebhooks.push({
        tenantId,
        event: webhookEvent,
        payload: {
          order_id: orderId,
          new_status: targetStatus,
        },
      });
    }
  } else {
    // Non-status update (e.g., total only)
    await OrderProvider.updateByUserId(orderId, newOrder, trx);
  }
};
