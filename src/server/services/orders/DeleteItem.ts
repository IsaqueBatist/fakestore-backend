import { OrderProvider } from "../../database/providers/orders";
import { ForbiddenError } from "../../errors";

export const deleteItem = async (
  userId: number,
  productId: number,
  orderId: number,
): Promise<void> => {
  const order = await OrderProvider.getById(orderId, userId);

  if (Number(order.user_id) !== userId)
    throw new ForbiddenError("errors:forbidden_action", { action: "delete", resource: "order item" });

  return await OrderProvider.deleteItem(order.id_order, productId);
};
