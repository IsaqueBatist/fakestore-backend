import { ProductProvider } from "../../database/providers/products";
import type { Knex } from "knex";

export const deleteCategory = async (trx: Knex.Transaction, categoryId: number, productId: number): Promise<void> => {
  return await ProductProvider.deleteCategory(categoryId, productId, trx);
};
