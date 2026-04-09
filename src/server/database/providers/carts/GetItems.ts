import { EtableNames } from "../../ETableNames";
import { ICart_Item } from "../../models";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const getItems = async (
  cartId: number,
  trx: KnexType.Transaction,
): Promise<ICart_Item[]> => {
  try {
    const items = await trx(EtableNames.cart_items)
      .select()
      .where("cart_id", cartId);

    return items;
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_getting_items", {
      resource: "cart",
    });
  }
};
