import { ProductProvider } from "../../database/providers/products";
import type { Knex } from "knex";

export const deleteComment = async (
  trx: Knex.Transaction,
  commentId: number,
  productId: number,
  userId: number,
): Promise<void> => {
  return await ProductProvider.deleteComment(commentId, productId, userId, trx);
};
