import { EtableNames } from "../../ETableNames";
import { IOrder } from "../../models/Order";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const getByUserId = async (
  userId: number,
  trx: KnexType.Transaction,
): Promise<IOrder[]> => {
  try {
    const result = await trx(EtableNames.orders)
      .select()
      .where("user_id", userId);

    if (result) return result;

    throw new NotFoundError("errors:not_found", { resource: "Order" });
  } catch (error) {
    logger.error({ err: error }, "Failed to get orders by user id");
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_getting", { resource: "order" });
  }
};
