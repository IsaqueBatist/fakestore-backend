import { ProductProvider } from "../../database/providers/products";
import type { Knex } from "knex";

export const addCategory = async (
  trx: Knex.Transaction,
  productId: number,
  categoryId: number,
): Promise<number> => {
  return await ProductProvider.addCategory(productId, categoryId, trx);
};
