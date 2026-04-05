import { ProductProvider } from "../../database/providers/products";
import { IProduct_Comment } from "../../database/models";

export const updateComment = async (
  newComment: Omit<IProduct_Comment, "id_product_comment" | "product_id" | "user_id">,
  userId: number,
  commentId: number,
): Promise<void> => {
  return await ProductProvider.updateComment(newComment, userId, commentId);
};
