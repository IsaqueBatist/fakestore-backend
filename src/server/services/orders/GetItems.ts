import { OrderProvider } from "../../database/providers/orders";
import { IOrder_Item } from "../../database/models";

export const getItems = async (userId: number, orderId: number): Promise<IOrder_Item[]> => {
  await OrderProvider.getById(orderId, userId);

  return await OrderProvider.getItems(orderId);
};
