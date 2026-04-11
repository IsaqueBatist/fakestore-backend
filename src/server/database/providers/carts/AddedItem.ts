import { EtableNames } from "../../ETableNames";
import { ICart_Item } from "../../models/Cart_Item";
import { DatabaseError, TransactionError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const addItem = async (
  newProduct: Omit<ICart_Item, "id_cart_item" | "added_at" | "cart_id">,
  cartId: number,
  trx: KnexType.Transaction,
): Promise<number> => {
  try {
    const [addedItem] = await trx(EtableNames.cart_items)
      .insert({ ...newProduct, cart_id: cartId })
      .returning("id_cart_item");

    if (!addedItem) throw new TransactionError("errors:unable_to_add_item");

    return Number(addedItem.id_cart_item);
  } catch (error) {
    logger.error({ err: error }, "Failed to add cart item");
    if (error instanceof TransactionError) throw error;
    throw new DatabaseError("errors:db_error_adding_item", {
      resource: "cart",
    });
  }
};
