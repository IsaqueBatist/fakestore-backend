import { EtableNames } from "../../ETableNames";
import { AppError, ConflictError, DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const createCart = async (
  userId: number,
  trx: KnexType.Transaction,
): Promise<number> => {
  try {
    const existingCart = await trx(EtableNames.cart)
      .select("id_cart")
      .where("user_id", userId)
      .first();

    if (existingCart) {
      throw new ConflictError("errors:resource_already_exists", {
        resource: "Cart",
      });
    }

    const [newCartId] = await trx(EtableNames.cart)
      .insert({ user_id: userId })
      .returning("id_cart");

    return newCartId.id_cart;
  } catch (error) {
    console.error("Error creating cart:", error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_creating", { resource: "cart" });
  }
};
