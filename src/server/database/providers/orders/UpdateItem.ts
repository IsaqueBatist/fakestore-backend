import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder_Item } from "../../models";
import {
  AppError,
  NotFoundError,
  DatabaseError,
} from "../../../errors";
import type { Knex as KnexType } from "knex";

export const updateItem = async (
  newProduct: Omit<IOrder_Item, "id_order_item" | "order_id">,
  orderId: number,
  trx?: KnexType.Transaction,
): Promise<void> => {
  try {
    const conn = trx ?? Knex;

    const result = await conn(EtableNames.order_items)
      .update({ ...newProduct })
      .where("order_id", orderId)
      .andWhere("product_id", newProduct.product_id);

    if (result === 0) {
      throw new NotFoundError("errors:not_found", { resource: "Order item" });
    }

    return;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_updating_item", { resource: "order" });
  }
};
