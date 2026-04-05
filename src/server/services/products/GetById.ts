import { ProductProvider } from "../../database/providers/products";
import { IProduct } from "../../database/models";
import type { Knex } from "knex";

export const getById = async (trx: Knex.Transaction, productId: number): Promise<IProduct> => {
  return await ProductProvider.getById(productId, trx);
};
