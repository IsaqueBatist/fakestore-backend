import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder } from "../../models/Order";
import { AppError, DatabaseError, NotFoundError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const updateByUserId = async (
  orderId: number,
  newOrder: Omit<IOrder, "id_order" | "created_at">,
  trx?: KnexType.Transaction,
): Promise<void> => {
  try {
    const conn = trx ?? Knex;
    const updatedRows = await conn(EtableNames.orders)
      .where("id_order", orderId)
      .update(newOrder);

    if (updatedRows === 0) {
      throw new NotFoundError("errors:not_found", { resource: "Order" });
    }

    return;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_updating", { resource: "order" });
  }
};
