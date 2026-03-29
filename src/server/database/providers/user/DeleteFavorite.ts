import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import {
  AppError,
  NotFoundError,
  DatabaseError,
} from "../../../errors";

export const deleteFavorite = async (
  userId: number,
  productId: number,
): Promise<void> => {
  try {
    const favorite = await Knex(EtableNames.user_favorites)
      .select()
      .where("product_id", productId)
      .andWhere("user_id", userId)
      .first();

    if (!favorite) {
      throw new NotFoundError("Favorite not found");
    }

    const result = await Knex(EtableNames.user_favorites)
      .where("product_id", productId)
      .andWhere("user_id", userId)
      .del();

    if (result !== 0) return;

    throw new DatabaseError("Error deleting favorite product");
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Database error while deleting favorite product`);
  }
};
