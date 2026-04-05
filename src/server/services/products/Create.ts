import { ProductProvider } from "../../database/providers/products";
import { IProduct } from "../../database/models";

export const create = async (product: Omit<IProduct, "id_product">): Promise<number | Error> => {
  return await ProductProvider.create(product);
};
