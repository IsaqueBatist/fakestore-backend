import { EtableNames } from "../../ETableNames";
import { IOrder_Item } from "../../models";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const getItems = async (
  orderId: number,
  trx: KnexType.Transaction,
): Promise<IOrder_Item[]> => {
  try {
    const items = await trx(EtableNames.order_items)
      .select()
      .where("order_id", orderId);

    return items;
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_getting_items", {
      resource: "order",
    });
  }
};
