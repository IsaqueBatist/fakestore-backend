import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICart_Item } from "../../models";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const getItems = async (userId: number): Promise<ICart_Item[]> => {
  try {
    const result = await Knex(EtableNames.cart)
      .select()
      .where("user_id", userId)
      .first();

    if (!result) throw new NotFoundError("errors:not_found", { resource: "Cart" });

    const items = await Knex(EtableNames.cart_items)
      .select()
      .where("cart_id", result.id_cart);

    if (items) return items;

    throw new NotFoundError("errors:items_not_found", { resource: "Cart" });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_getting_items", { resource: "cart" });
  }
};
