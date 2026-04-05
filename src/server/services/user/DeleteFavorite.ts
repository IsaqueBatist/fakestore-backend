import { UserProvider } from "../../database/providers/user";
import type { Knex } from "knex";

export const deleteFavorite = async (trx: Knex.Transaction, userId: number, productId: number): Promise<void> => {
  return await UserProvider.deleteFavorite(userId, productId, trx);
};
