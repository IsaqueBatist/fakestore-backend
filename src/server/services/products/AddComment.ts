import { ProductProvider } from "../../database/providers/products";
import { IProduct_Comment } from "../../database/models";

export const addComment = async (
  productId: number,
  comment: Omit<IProduct_Comment, "id_product_comment" | "product_id" | "user_id">,
  userId: number,
): Promise<number> => {
  await ProductProvider.getById(productId);

  return await ProductProvider.addComment(productId, comment, userId);
};
