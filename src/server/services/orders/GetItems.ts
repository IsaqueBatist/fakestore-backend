import { OrderProvider } from "../../database/providers/orders";
import { IOrder_Item } from "../../database/models";
import type { Knex } from "knex";

export const getItems = async (trx: Knex.Transaction, userId: number, orderId: number): Promise<IOrder_Item[]> => {
  await OrderProvider.getById(orderId, userId, trx);

  return await OrderProvider.getItems(orderId, trx);
};
