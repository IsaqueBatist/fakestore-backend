import { OrderProvider } from "../../database/providers/orders";
import { IOrder } from "../../database/models";
import type { Knex } from "knex";

export const getByUserId = async (
  trx: Knex.Transaction,
  userId: number,
): Promise<IOrder[]> => {
  return await OrderProvider.getByUserId(userId, trx);
};
