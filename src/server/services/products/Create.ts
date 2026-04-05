import { ProductProvider } from "../../database/providers/products";
import { IProduct } from "../../database/models";
import type { Knex } from "knex";

export const create = async (trx: Knex.Transaction, product: Omit<IProduct, "id_product">): Promise<number | Error> => {
  return await ProductProvider.create(product, trx);
};
