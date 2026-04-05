import { ProductProvider } from "../../database/providers/products";

export const deleteById = async (productId: number): Promise<void> => {
  return await ProductProvider.deleteById(productId);
};
