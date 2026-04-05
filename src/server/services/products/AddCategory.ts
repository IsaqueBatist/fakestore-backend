import { ProductProvider } from "../../database/providers/products";

export const addCategory = async (productId: number, categoryId: number): Promise<number> => {
  return await ProductProvider.addCategory(productId, categoryId);
};
