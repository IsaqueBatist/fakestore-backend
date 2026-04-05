import { ProductProvider } from "../../database/providers/products";
import { IProduct_Comment } from "../../database/models";

export const getAllComments = async (productId: number): Promise<IProduct_Comment[] | Error> => {
  await ProductProvider.getById(productId);

  return await ProductProvider.getAllComments(productId);
};
