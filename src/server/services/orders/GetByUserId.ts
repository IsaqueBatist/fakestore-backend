import { OrderProvider } from "../../database/providers/orders";
import { IOrder } from "../../database/models";

export const getByUserId = async (userId: number): Promise<IOrder[]> => {
  return await OrderProvider.getByUserId(userId);
};
