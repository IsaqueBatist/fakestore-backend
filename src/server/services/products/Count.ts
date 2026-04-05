import { ProductProvider } from "../../database/providers/products";
import type { Knex } from "knex";

export const count = async (trx: Knex.Transaction, filter?: string): Promise<number> => {
  return await ProductProvider.count(filter, trx);
};
