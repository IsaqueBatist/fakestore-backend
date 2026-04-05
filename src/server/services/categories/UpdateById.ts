import { CategoryProvider } from "../../database/providers/categories";
import { ICategory } from "../../database/models";

export const updateById = async (
  categoryId: number,
  newCategory: Omit<ICategory, "id_category">,
): Promise<void> => {
  return await CategoryProvider.updateById(categoryId, newCategory);
};
