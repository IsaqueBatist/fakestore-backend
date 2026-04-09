import { ProductProvider } from "../../database/providers/products";
import type { Knex } from "knex";

export const deleteById = async (
  trx: Knex.Transaction,
  productId: number,
): Promise<void> => {
  return await ProductProvider.deleteById(productId, trx);
};
