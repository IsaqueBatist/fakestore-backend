import { EtableNames } from "../../ETableNames";
import { ICart } from "../../models";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const getByUserId = async (
  userId: number,
  trx: KnexType.Transaction,
): Promise<ICart> => {
  try {
    const result = await trx(EtableNames.cart)
      .select()
      .where("user_id", userId)
      .first();

    if (result) return result;

    throw new NotFoundError("errors:not_found", { resource: "Cart" });
  } catch (error) {
    logger.error({ err: error }, "Failed to get cart by user id");
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_getting", { resource: "cart" });
  }
};
