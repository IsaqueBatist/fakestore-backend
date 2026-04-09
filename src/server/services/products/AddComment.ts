import { ProductProvider } from "../../database/providers/products";
import { IProduct_Comment } from "../../database/models";
import type { Knex } from "knex";

export const addComment = async (
  trx: Knex.Transaction,
  productId: number,
  comment: Omit<
    IProduct_Comment,
    "id_product_comment" | "product_id" | "user_id" | "tenant_id"
  >,
  userId: number,
): Promise<number> => {
  await ProductProvider.getById(productId, trx);

  return await ProductProvider.addComment(productId, comment, userId, trx);
};
