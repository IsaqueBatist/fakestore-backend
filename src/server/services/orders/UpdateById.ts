import { OrderProvider } from "../../database/providers/orders";
import { IOrder } from "../../database/models";
import type { Knex } from "knex";

export const updateByUserId = async (
  trx: Knex.Transaction,
  orderId: number,
  newOrder: Omit<IOrder, "id_order" | "created_at">,
): Promise<void> => {
  return await OrderProvider.updateByUserId(orderId, newOrder, trx);
};
