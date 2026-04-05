import { CategoryProvider } from "../../database/providers/categories";

export const deleteById = async (categoryId: number): Promise<void> => {
  return await CategoryProvider.deleteById(categoryId);
};
