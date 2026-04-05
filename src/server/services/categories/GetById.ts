import { CategoryProvider } from "../../database/providers/categories";
import { ICategory } from "../../database/models";
import type { Knex } from "knex";

export const getById = async (trx: Knex.Transaction, categoryId: number): Promise<ICategory> => {
  return await CategoryProvider.getById(categoryId, trx);
};
