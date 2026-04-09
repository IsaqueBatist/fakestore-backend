import { OrderProvider } from "../../database/providers/orders";
import type { Knex } from "knex";

export const deleteById = async (
  trx: Knex.Transaction,
  orderId: number,
): Promise<void> => {
  return await OrderProvider.deleteById(orderId, trx);
};
