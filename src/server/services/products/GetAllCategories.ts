import { ProductProvider } from "../../database/providers/products";
import { IProduct_Category } from "../../database/models/Product_category";
import type { Knex } from "knex";

export const getAllCategories = async (trx: Knex.Transaction, productId: number): Promise<IProduct_Category[] | Error> => {
  return await ProductProvider.getAllCategories(productId, trx);
};
