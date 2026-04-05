import { CategoryProvider } from "../../database/providers/categories";
import type { Knex } from "knex";

export const count = async (trx: Knex.Transaction, filter?: string): Promise<number> => {
  return await CategoryProvider.count(filter, trx);
};
