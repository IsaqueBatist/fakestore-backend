import { ProductProvider } from "../../database/providers/products";

export const deleteCategory = async (categoryId: number, productId: number): Promise<void> => {
  return await ProductProvider.deleteCategory(categoryId, productId);
};
