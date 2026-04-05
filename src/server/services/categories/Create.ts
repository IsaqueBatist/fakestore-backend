import { CategoryProvider } from "../../database/providers/categories";
import { ICategory } from "../../database/models";

export const create = async (category: Omit<ICategory, "id_category">): Promise<number | Error> => {
  return await CategoryProvider.create(category);
};
