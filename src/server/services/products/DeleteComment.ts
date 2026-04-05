import { ProductProvider } from "../../database/providers/products";

export const deleteComment = async (
  commentId: number,
  productId: number,
  userId: number,
): Promise<void> => {
  return await ProductProvider.deleteComment(commentId, productId, userId);
};
