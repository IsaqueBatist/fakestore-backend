import { OrderProvider } from "../../database/providers/orders";
import { ForbiddenError } from "../../errors";
import type { Knex } from "knex";

export const deleteItem = async (
  trx: Knex.Transaction,
  userId: number,
  productId: number,
  orderId: number,
): Promise<void> => {
  const order = await OrderProvider.getById(orderId, userId, trx);

  if (Number(order.user_id) !== userId)
    throw new ForbiddenError("errors:forbidden_action", { action: "delete", resource: "order item" });

  return await OrderProvider.deleteItem(order.id_order, productId, trx);
};
