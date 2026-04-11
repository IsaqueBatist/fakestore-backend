import { EtableNames } from "../../ETableNames";
import { TransactionError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const updateItemQuantity = async (
  orderId: number,
  productId: number,
  quantity: number,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const [updateItem] = await trx(EtableNames.order_items)
      .update({ quantity })
      .where("order_id", orderId)
      .andWhere("product_id", productId)
      .returning("id_order_item");

    if (!updateItem)
      throw new TransactionError("errors:unable_to_increase_quantity");
  } catch (error) {
    logger.error({ err: error }, "Failed to update order item quantity");
    if (error instanceof TransactionError) throw error;
    throw new DatabaseError("errors:db_error_updating_item", {
      resource: "order",
    });
  }
};
