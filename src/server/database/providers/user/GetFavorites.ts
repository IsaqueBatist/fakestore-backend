import { DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IUser_Favorite } from "../../models/User_favorite";
import type { Knex as KnexType } from "knex";

export const getFavorites = async (
  userId: number,
  trx?: KnexType.Transaction,
): Promise<IUser_Favorite[]> => {
  try {
    const conn = trx ?? Knex;
    const result = await conn(EtableNames.user_favorites)
      .select()
      .where("user_id", userId);

    return result;
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_getting", { resource: "favorite products" });
  }
};
