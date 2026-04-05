import { ProductProvider } from "../../database/providers/products";
import { IProduct } from "../../database/models";

export const getAll = async (
  page: number,
  limit: number,
  filter: string,
  id?: number,
): Promise<IProduct[] | Error> => {
  return await ProductProvider.getAll(page, limit, filter, id);
};
