import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const addFavorite = async (
  productId: number,
  userId: number,
  trx?: KnexType.Transaction,
): Promise<number> => {
  try {
    const conn = trx ?? Knex;

    const [result] = await conn(EtableNames.user_favorites)
      .insert({ user_id: userId, product_id: productId })
      .returning("product_id");

    if (result) return Number(result.product_id);

    throw new DatabaseError("errors:db_error_adding", { resource: "favorite" });
  } catch (error) {
    console.error(error);
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError("errors:db_error_adding", { resource: "favorite" });
  }
};
