import { EtableNames } from "../../ETableNames";
import { IOrder } from "../../models/Order";
import {
  AppError,
  NotFoundError,
  DatabaseError,
} from "../../../errors";
import type { Knex as KnexType } from "knex";

export const getById = async (
  orderId: number,
  userId: number | undefined,
  trx: KnexType.Transaction,
): Promise<IOrder> => {
  try {
    const query = trx(EtableNames.orders)
      .select()
      .where("id_order", orderId);

    if (userId !== undefined) {
      query.andWhere("user_id", userId);
    }

    const result = await query.first().forUpdate();

    if (!result) throw new NotFoundError("errors:not_found", { resource: "Order" });

    return result;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_getting", { resource: "order" });
  }
};
