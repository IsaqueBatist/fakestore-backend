import { CategoryProvider } from "../../database/providers/categories";
import { ICategory } from "../../database/models";

export const getById = async (categoryId: number): Promise<ICategory> => {
  return await CategoryProvider.getById(categoryId);
};
