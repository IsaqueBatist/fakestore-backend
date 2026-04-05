import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { TransactionError, DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const updateItemQuantity = async (
  cartId: number,
  productId: number,
  quantity: number,
  trx?: KnexType.Transaction,
): Promise<number> => {
  try {
    const conn = trx ?? Knex;

    const [updateItem] = await conn(EtableNames.cart_items)
      .update({ quantity })
      .where("cart_id", cartId)
      .andWhere("product_id", productId)
      .returning("id_cart_item");

    if (!updateItem)
      throw new TransactionError("errors:unable_to_increase_quantity");

    return Number(updateItem.id_cart_item);
  } catch (error) {
    console.error(error);
    if (error instanceof TransactionError) throw error;
    throw new DatabaseError("errors:db_error_updating_item", { resource: "cart" });
  }
};
