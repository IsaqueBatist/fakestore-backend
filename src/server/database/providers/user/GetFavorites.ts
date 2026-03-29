import { DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IUser_Favorite } from "../../models/User_favorite";

export const getFavorites = async (
  userId: number,
): Promise<IUser_Favorite[] | Error> => {
  try {
    const result = await Knex(EtableNames.user_favorites)
      .select()
      .where("user_id", userId);

    return result;
  } catch (error) {
    console.error(error);
    throw new DatabaseError("Error getting favorite products");
  }
};
