import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const createCart = async (userId: number): Promise<number | Error> => {
  try {
    // Verifica se o usuário já possui um carrinho
    const existingCart = await Knex(EtableNames.cart)
      .select('id_cart')
      .where('user_id', userId)
      .first();

    if (existingCart) {
      return new Error("Cart already exists for this user.");
    }

    const [newCartId] = await Knex(EtableNames.cart)
      .insert({ user_id: userId })
      .returning('id_cart');

    return newCartId.id_cart;
  } catch (error) {
    console.error("Error creating cart:", error);
    return new Error("Database error while creating cart.");
  }
}
