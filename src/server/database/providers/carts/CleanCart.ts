import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const cleanCart = async (cartId: number, trx?: KnexType.Transaction): Promise<void> => {
  try {
    const conn = trx ?? Knex;

    await conn(EtableNames.cart_items)
      .delete()
      .where("cart_id", cartId);

    return;
  } catch (error) {
    console.error("Error cleaning cart:", error);
    throw new DatabaseError("errors:db_error_cleaning", { resource: "cart" });
  }
};
