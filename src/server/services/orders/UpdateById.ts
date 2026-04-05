import { OrderProvider } from "../../database/providers/orders";
import { IOrder } from "../../database/models";

export const updateByUserId = async (
  orderId: number,
  newOrder: Omit<IOrder, "id_order" | "created_at">,
): Promise<void> => {
  return await OrderProvider.updateByUserId(orderId, newOrder);
};
