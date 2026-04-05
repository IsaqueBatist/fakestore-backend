import { CategoryProvider } from "../../database/providers/categories";
import { ICategory } from "../../database/models";
import type { Knex } from "knex";

export const updateById = async (
  trx: Knex.Transaction,
  categoryId: number,
  newCategory: Omit<ICategory, "id_category">,
): Promise<void> => {
  return await CategoryProvider.updateById(categoryId, newCategory, trx);
};
