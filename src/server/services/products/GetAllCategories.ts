import { ProductProvider } from "../../database/providers/products";
import { IProduct_Category } from "../../database/models/Product_category";

export const getAllCategories = async (productId: number): Promise<IProduct_Category[] | Error> => {
  return await ProductProvider.getAllCategories(productId);
};
