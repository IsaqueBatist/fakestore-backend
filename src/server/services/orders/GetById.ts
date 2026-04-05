import { OrderProvider } from "../../database/providers/orders";
import { ForbiddenError } from "../../errors";
import { IOrder } from "../../database/models";

export const getById = async (orderId: number, userId: number): Promise<IOrder> => {
  const order = await OrderProvider.getById(orderId);

  if (Number(order.user_id) !== userId)
    throw new ForbiddenError("errors:forbidden_action", { action: "get", resource: "order" });

  return order;
};
