import { UserProvider } from "../../database/providers/user";
import { IUser_Favorite } from "../../database/models/User_favorite";
import type { Knex } from "knex";

export const getFavorites = async (trx: Knex.Transaction, userId: number): Promise<IUser_Favorite[]> => {
  return await UserProvider.getFavorites(userId, trx);
};
