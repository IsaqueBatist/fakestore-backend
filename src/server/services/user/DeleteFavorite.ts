import { UserProvider } from "../../database/providers/user";

export const deleteFavorite = async (userId: number, productId: number): Promise<void> => {
  return await UserProvider.deleteFavorite(userId, productId);
};
