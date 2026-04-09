import { ProductProvider } from "../../database/providers/products";
import { IProduct_Comment } from "../../database/models";
import type { Knex } from "knex";

export const getAllComments = async (
  trx: Knex.Transaction,
  productId: number,
): Promise<IProduct_Comment[] | Error> => {
  await ProductProvider.getById(productId, trx);

  return await ProductProvider.getAllComments(productId, trx);
};
