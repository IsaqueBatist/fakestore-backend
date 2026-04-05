import { ProductProvider } from "../../database/providers/products";

export const count = async (filter?: string): Promise<number> => {
  return await ProductProvider.count(filter);
};
