import { UserProvider } from "../../database/providers/user";
import { IUser_Favorite } from "../../database/models/User_favorite";

export const getFavorites = async (userId: number): Promise<IUser_Favorite[]> => {
  return await UserProvider.getFavorites(userId);
};
