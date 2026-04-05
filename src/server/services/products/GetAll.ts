import { ProductProvider } from "../../database/providers/products";
import { IProduct } from "../../database/models";
import type { Knex } from "knex";

export const getAll = async (
  trx: Knex.Transaction,
  limit: number,
  filter: string,
  afterCursor: number,
): Promise<IProduct[]> => {
  return await ProductProvider.getAll(limit, filter, afterCursor, trx);
};
