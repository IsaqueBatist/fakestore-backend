import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import {
  AppError,
  ConflictError,
  NotFoundError,
  BadRequestError,
  DatabaseError,
} from "../../../errors";

export const addFavorite = async (
  productId: number,
  userId: number,
): Promise<number> => {
  try {
    const [alredyFavorite] = await Knex(EtableNames.user_favorites)
      .select()
      .where("product_id", productId)
      .andWhere("user_id", userId)
      .returning("product_id");

    if (alredyFavorite) throw new ConflictError("Product");

    const product = await Knex(EtableNames.products)
      .select("id_product")
      .where("id_product", productId)
      .first();

    if (!product) {
      throw new NotFoundError(`Product`);
    }

    const user = await Knex(EtableNames.user)
      .select("id_user")
      .where("id_user", userId)
      .first();

    if (!user) {
      throw new NotFoundError(`User`);
    }

    const [result] = await Knex(EtableNames.user_favorites)
      .insert({ user_id: userId, product_id: productId })
      .returning("product_id");

    if (result) return Number(result.product_id);

    throw new BadRequestError(`Error adding product to favorites`);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Database error while add product to favorites`);
  }
};
