import { CategoryProvider } from "../../database/providers/categories";
import type { Knex } from "knex";

export const deleteById = async (
  trx: Knex.Transaction,
  categoryId: number,
): Promise<void> => {
  return await CategoryProvider.deleteById(categoryId, trx);
};
