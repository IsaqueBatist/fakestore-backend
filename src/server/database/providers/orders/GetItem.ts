import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder_Item } from "../../models";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const getItem = async (
  orderId: number,
  productId: number,
  trx?: KnexType.Transaction,
): Promise<IOrder_Item | undefined> => {
  try {
    const conn = trx ?? Knex;

    const result = await conn(EtableNames.order_items)
      .where({
        order_id: orderId,
        product_id: productId,
      })
      .first();

    return result;
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_getting", { resource: "order item" });
  }
};
