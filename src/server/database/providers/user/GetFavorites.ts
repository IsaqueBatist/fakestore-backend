import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import { EtableNames } from "../../ETableNames";
import { IUser_Favorite } from "../../models/User_favorite";
import type { Knex as KnexType } from "knex";

export const getFavorites = async (
  userId: number,
  trx: KnexType.Transaction,
): Promise<IUser_Favorite[]> => {
  try {
    const result = await trx(EtableNames.user_favorites)
      .select()
      .where("user_id", userId);

    return result;
  } catch (error) {
    logger.error({ err: error }, "Failed to get user favorites");
    throw new DatabaseError("errors:db_error_getting", {
      resource: "favorite products",
    });
  }
};
