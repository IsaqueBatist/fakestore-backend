import { ProductProvider } from "../../database/providers/products";
import { IProduct } from "../../database/models";
import type { Knex } from "knex";

export const updateById = async (
  trx: Knex.Transaction,
  productId: number,
  newProduct: Omit<IProduct, "id_product">,
): Promise<void | Error> => {
  return await ProductProvider.updateById(productId, newProduct, trx);
};
