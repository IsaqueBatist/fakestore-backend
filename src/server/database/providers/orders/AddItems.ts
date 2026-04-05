import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder_Item } from "../../models";
import { TransactionError, DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const addItems = async (
  orderItems: Omit<IOrder_Item, "id_order_item">[],
  trx?: KnexType.Transaction,
): Promise<void> => {
  try {
    const conn = trx ?? Knex;

    const result = await conn(EtableNames.order_items).insert(orderItems);

    if (!result)
      throw new TransactionError("errors:error_adding_items_to_order");
  } catch (error) {
    console.error(error);
    if (error instanceof TransactionError) throw error;
    throw new DatabaseError("errors:db_error_adding_item", { resource: "order" });
  }
};
