import { EtableNames } from "../../ETableNames";
import { ICart_Item } from "../../models/Cart_Item";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const updateItem = async (
  newProduct: Omit<
    ICart_Item,
    "id_cart_item" | "added_at" | "cart_id" | "product_id"
  >,
  cartId: number,
  productId: number,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const result = await trx(EtableNames.cart_items)
      .update({ ...newProduct, cart_id: cartId })
      .where("cart_id", cartId)
      .andWhere("product_id", productId);

    if (result === 0) {
      throw new NotFoundError("errors:not_found", { resource: "Cart item" });
    }

    return;
  } catch (error) {
    logger.error({ err: error }, "Failed to update cart item");
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_updating_item", {
      resource: "cart",
    });
  }
};
