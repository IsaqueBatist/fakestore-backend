import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IUser_Favorite } from "../../models/User_favorite";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const getFavorite = async (
  productId: number,
  userId: number,
  trx?: KnexType.Transaction,
): Promise<IUser_Favorite | undefined> => {
  try {
    const conn = trx ?? Knex;

    const result = await conn(EtableNames.user_favorites)
      .select()
      .where("product_id", productId)
      .andWhere("user_id", userId)
      .first();

    return result;
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_getting", { resource: "favorite" });
  }
};
