import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import {
  AppError,
  ConflictError,
  NotFoundError,
  DatabaseError,
} from "../../../errors";

export const addFavorite = async (
  productId: number,
  userId: number,
): Promise<number> => {
  try {
    const [alreadyFavorite] = await Knex(EtableNames.user_favorites)
      .select()
      .where("product_id", productId)
      .andWhere("user_id", userId)
      .returning("product_id");

    if (alreadyFavorite) throw new ConflictError("errors:resource_already_exists", { resource: "Product" });

    const product = await Knex(EtableNames.products)
      .select("id_product")
      .where("id_product", productId)
      .first();

    if (!product) {
      throw new NotFoundError("errors:not_found", { resource: "Product" });
    }

    const user = await Knex(EtableNames.user)
      .select("id_user")
      .where("id_user", userId)
      .first();

    if (!user) {
      throw new NotFoundError("errors:not_found", { resource: "User" });
    }

    const [result] = await Knex(EtableNames.user_favorites)
      .insert({ user_id: userId, product_id: productId })
      .returning("product_id");

    if (result) return Number(result.product_id);

    throw new DatabaseError("errors:db_error_adding", { resource: "favorite" });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_adding", { resource: "favorite" });
  }
};
