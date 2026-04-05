import { CategoryProvider } from "../../database/providers/categories";
import { ICategory } from "../../database/models";
import type { Knex } from "knex";

export const create = async (trx: Knex.Transaction, category: Omit<ICategory, "id_category">): Promise<number | Error> => {
  return await CategoryProvider.create(category, trx);
};
