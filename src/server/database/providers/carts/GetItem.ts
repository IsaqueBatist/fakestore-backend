import { EtableNames } from "../../ETableNames";
import { ICart_Item } from "../../models/Cart_Item";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const getItem = async (
  cartId: number,
  productId: number,
  trx: KnexType.Transaction,
): Promise<ICart_Item | undefined> => {
  try {
    const result = await trx(EtableNames.cart_items)
      .where({
        cart_id: cartId,
        product_id: productId,
      })
      .first()
      .forUpdate();

    return result;
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_getting", { resource: "cart item" });
  }
};
