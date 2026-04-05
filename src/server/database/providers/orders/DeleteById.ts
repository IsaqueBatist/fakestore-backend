import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import {
  AppError,
  NotFoundError,
  DatabaseError,
} from "../../../errors";

export const deleteById = async (orderId: number): Promise<void> => {
  try {
    const result = await Knex(EtableNames.orders)
      .where("id_order", orderId)
      .del();

    if (result > 0) return;

    throw new NotFoundError("errors:not_found", { resource: "Order" });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_deleting", { resource: "order" });
  }
};
