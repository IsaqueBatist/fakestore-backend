import { ProductProvider } from "../../database/providers/products";
import { IProduct } from "../../database/models";
import type { Knex } from "knex";

export const getAll = async (
  trx: Knex.Transaction,
  page: number,
  limit: number,
  filter: string,
  id?: number,
): Promise<IProduct[] | Error> => {
  return await ProductProvider.getAll(page, limit, filter, id, trx);
};
