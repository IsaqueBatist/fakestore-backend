import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { AppError, ConflictError, DatabaseError } from "../../../errors";

export const createCart = async (userId: number): Promise<number> => {
  try {
    // Verifica se o usuário já possui um carrinho
    const existingCart = await Knex(EtableNames.cart)
      .select("id_cart")
      .where("user_id", userId)
      .first();

    if (existingCart) {
      throw new ConflictError("Cart");
    }

    const [newCartId] = await Knex(EtableNames.cart)
      .insert({ user_id: userId })
      .returning("id_cart");

    return newCartId.id_cart;
  } catch (error) {
    console.error("Error creating cart:", error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("Database error while creating cart.");
  }
};
