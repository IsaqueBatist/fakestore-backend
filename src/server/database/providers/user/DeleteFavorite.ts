import { EtableNames } from "../../ETableNames";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const deleteFavorite = async (
  userId: number,
  productId: number,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const result = await trx(EtableNames.user_favorites)
      .where("product_id", productId)
      .andWhere("user_id", userId)
      .del();

    if (result !== 0) return;

    throw new NotFoundError("errors:not_found", { resource: "Favorite" });
  } catch (error) {
    logger.error({ err: error }, "Failed to delete user favorite");
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_deleting", {
      resource: "favorite",
    });
  }
};
