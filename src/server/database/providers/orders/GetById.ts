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

    if (!result) throw new NotFoundError("Order not found");

    if (Number(result.user_id) !== userId)
      throw new ForbiddenError("You cant get this order");

    return result;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Database error while getting order`);
  }
};
