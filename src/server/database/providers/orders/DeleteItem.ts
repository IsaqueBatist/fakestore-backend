import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import {
  AppError,
  NotFoundError,
  DatabaseError,
} from "../../../errors";
import type { Knex as KnexType } from "knex";

export const deleteItem = async (
  orderId: number,
  productId: number,
  trx?: KnexType.Transaction,
): Promise<void> => {
  try {
    const conn = trx ?? Knex;

    const deletedRows = await conn(EtableNames.order_items)
      .where("order_id", orderId)
      .andWhere("product_id", productId)
      .delete();

    if (deletedRows === 0) {
      throw new NotFoundError("errors:not_found", { resource: "Order item" });
    }

    return;
  } catch (error) {
    console.error("Error deleting order item:", error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_deleting_item", { resource: "order" });
  }
};
