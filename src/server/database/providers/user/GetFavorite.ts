import { EtableNames } from "../../ETableNames";
import { IUser_Favorite } from "../../models/User_favorite";
import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const getFavorite = async (
  productId: number,
  userId: number,
  trx: KnexType.Transaction,
): Promise<IUser_Favorite | undefined> => {
  try {
    const result = await trx(EtableNames.user_favorites)
      .select()
      .where("product_id", productId)
      .andWhere("user_id", userId)
      .first();

    return result;
  } catch (error) {
    logger.error({ err: error }, "Failed to get user favorite");
    throw new DatabaseError("errors:db_error_getting", {
      resource: "favorite",
    });
  }
};
