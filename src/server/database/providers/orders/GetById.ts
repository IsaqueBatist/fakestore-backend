import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder } from "../../models/Order";
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  DatabaseError,
} from "../../../errors";

export const getById = async (
  orderId: number,
  userId: number,
): Promise<IOrder> => {
  try {
    const result = await Knex(EtableNames.orders)
      .select()
      .where("id_order", orderId)
      .first();

    if (!result) throw new NotFoundError("errors:not_found", { resource: "Order" });

    if (Number(result.user_id) !== userId)
      throw new ForbiddenError("errors:forbidden_action", { action: "get", resource: "order" });

    return result;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_getting", { resource: "order" });
  }
};
