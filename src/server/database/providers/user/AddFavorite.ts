import { EtableNames } from "../../ETableNames";
import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const addFavorite = async (
  productId: number,
  userId: number,
  trx: KnexType.Transaction,
): Promise<number> => {
  try {
    const [result] = await trx(EtableNames.user_favorites)
      .insert({ user_id: userId, product_id: productId })
      .returning("product_id");

    if (result) return Number(result.product_id);

    throw new DatabaseError("errors:db_error_adding", { resource: "favorite" });
  } catch (error) {
    logger.error({ err: error }, "Failed to add user favorite");
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError("errors:db_error_adding", { resource: "favorite" });
  }
};
