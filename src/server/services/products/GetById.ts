import { ProductProvider } from "../../database/providers/products";
import { IProduct } from "../../database/models";

export const getById = async (productId: number): Promise<IProduct> => {
  return await ProductProvider.getById(productId);
};
