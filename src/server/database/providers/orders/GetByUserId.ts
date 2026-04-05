import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder } from "../../models/Order";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const getByUserId = async (userId: number): Promise<IOrder[]> => {
  try {
    const result = await Knex(EtableNames.orders)
      .select()
      .where("user_id", userId);

    if (result) return result;

    throw new NotFoundError("errors:not_found", { resource: "Order" });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_getting", { resource: "order" });
  }
};
