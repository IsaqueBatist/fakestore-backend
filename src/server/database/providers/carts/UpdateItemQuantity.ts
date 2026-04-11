import { EtableNames } from "../../ETableNames";
import { TransactionError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const updateItemQuantity = async (
  cartId: number,
  productId: number,
  quantity: number,
  trx: KnexType.Transaction,
): Promise<number> => {
  try {
    const [updateItem] = await trx(EtableNames.cart_items)
      .update({ quantity })
      .where("cart_id", cartId)
      .andWhere("product_id", productId)
      .returning("id_cart_item");

    if (!updateItem)
      throw new TransactionError("errors:unable_to_increase_quantity");

    return Number(updateItem.id_cart_item);
  } catch (error) {
    logger.error({ err: error }, "Failed to update cart item quantity");
    if (error instanceof TransactionError) throw error;
    throw new DatabaseError("errors:db_error_updating_item", {
      resource: "cart",
    });
  }
};
