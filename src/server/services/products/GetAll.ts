import { ProductProvider } from "../../database/providers/products";
import { IProduct } from "../../database/models";
import type { IGetAllOptions } from "../../database/providers/products/GetAll";
import type { Knex } from "knex";

export const getAll = async (
  trx: Knex.Transaction,
  options: IGetAllOptions,
): Promise<IProduct[]> => {
  return await ProductProvider.getAll(options, trx);
};
