import { ProductProvider } from "../../database/providers/products";
import { IProduct } from "../../database/models";

export const updateById = async (
  productId: number,
  newProduct: Omit<IProduct, "id_product">,
): Promise<void | Error> => {
  return await ProductProvider.updateById(productId, newProduct);
};
