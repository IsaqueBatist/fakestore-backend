import { OrderProvider } from "../../database/providers/orders";

export const deleteById = async (orderId: number): Promise<void> => {
  return await OrderProvider.deleteById(orderId);
};
