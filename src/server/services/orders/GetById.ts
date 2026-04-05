import { OrderProvider } from "../../database/providers/orders";
import { ForbiddenError } from "../../errors";
import { IOrder } from "../../database/models";
import type { Knex } from "knex";

export const getById = async (trx: Knex.Transaction, orderId: number, userId: number): Promise<IOrder> => {
  const order = await OrderProvider.getById(orderId, undefined, trx);

  if (Number(order.user_id) !== userId)
    throw new ForbiddenError("errors:forbidden_action", { action: "get", resource: "order" });

  return order;
};
