import { CategoryProvider } from "../../database/providers/categories";
import { ICategory } from "../../database/models";

export const getAll = async (
  page: number,
  limit: number,
  filter: string,
  id?: number,
): Promise<ICategory[]> => {
  return await CategoryProvider.getAll(page, limit, filter, id);
};
