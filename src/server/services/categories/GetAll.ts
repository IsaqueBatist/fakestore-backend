import { CategoryProvider } from "../../database/providers/categories";
import { ICategory } from "../../database/models";
import type { Knex } from "knex";

export const getAll = async (
  trx: Knex.Transaction,
  page: number,
  limit: number,
  filter: string,
  id?: number,
): Promise<ICategory[]> => {
  return await CategoryProvider.getAll(page, limit, filter, id, trx);
};
