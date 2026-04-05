import { EtableNames } from "../../ETableNames";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const deleteItem = async (
  cartId: number,
  productId: number,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const deletedRows: number = await trx(EtableNames.cart_items)
      .delete()
      .where("cart_id", cartId)
      .andWhere("product_id", productId);

    if (deletedRows === 0) {
      throw new NotFoundError("errors:not_found", { resource: "Cart item" });
    }

    return;
  } catch (error) {
    console.error("Error deleting cart item:", error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_deleting_item", { resource: "cart" });
  }
};
