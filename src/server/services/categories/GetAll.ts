import { CategoryProvider } from "../../database/providers/categories";
import { ICategory } from "../../database/models";
import type { Knex } from "knex";

export const getAll = async (
  trx: Knex.Transaction,
  limit: number,
  filter: string,
  afterCursor: number,
): Promise<ICategory[]> => {
  return await CategoryProvider.getAll(limit, filter, afterCursor, trx);
};
