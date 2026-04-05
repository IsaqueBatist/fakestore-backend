import { CategoryProvider } from "../../database/providers/categories";

export const count = async (filter?: string): Promise<number> => {
  return await CategoryProvider.count(filter);
};
