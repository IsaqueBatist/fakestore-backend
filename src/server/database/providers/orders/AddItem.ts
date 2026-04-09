import { EtableNames } from "../../ETableNames";
import { IOrder_Item } from "../../models/Order_item";
import { TransactionError, DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const addItem = async (
  orderItem: Omit<IOrder_Item, "id_order_item" | "tenant_id">,
  trx: KnexType.Transaction,
): Promise<number> => {
  try {
    const [result] = await trx(EtableNames.order_items)
      .insert(orderItem)
      .returning("id_order_item");

    if (!result) throw new TransactionError("errors:unable_to_add_item");

    return Number(result.id_order_item);
  } catch (error) {
    console.error(error);
    if (error instanceof TransactionError) throw error;
    throw new DatabaseError("errors:db_error_adding_item", {
      resource: "order",
    });
  }
};
