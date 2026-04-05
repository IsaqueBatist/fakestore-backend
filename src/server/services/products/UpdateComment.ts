import { ProductProvider } from "../../database/providers/products";
import { IProduct_Comment } from "../../database/models";
import type { Knex } from "knex";

export const updateComment = async (
  trx: Knex.Transaction,
  newComment: Omit<IProduct_Comment, "id_product_comment" | "product_id" | "user_id" | "tenant_id">,
  userId: number,
  commentId: number,
): Promise<void> => {
  return await ProductProvider.updateComment(newComment, userId, commentId, trx);
};
