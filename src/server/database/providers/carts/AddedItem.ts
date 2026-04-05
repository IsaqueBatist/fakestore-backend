import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICart_Item } from "../../models/Cart_Item";
import {
  AppError,
  NotFoundError,
  TransactionError,
  DatabaseError,
} from "../../../errors";

export const addItem = async (
  newProduct: Omit<ICart_Item, "id_cart_item" | "added_at" | "cart_id">,
  userId: number,
): Promise<number | Error> => {
  try {
    return await Knex.transaction(async (trx) => {
      const userCart = await trx(EtableNames.cart)
        .select("id_cart")
        .where("user_id", userId)
        .first();

      if (!userCart) {
        throw new NotFoundError("errors:not_found", { resource: "Cart" });
      }

      const product = await trx(EtableNames.products)
        .select()
        .where("id_product", newProduct.product_id)
        .first();

      if (!product) throw new NotFoundError("errors:not_found", { resource: "Product" });

      const existItem = await trx(EtableNames.cart_items)
        .where({
          cart_id: userCart.id_cart,
          product_id: newProduct.product_id,
        })
        .first()
        .forUpdate();

      if (existItem) {
        const [updateItem] = await trx(EtableNames.cart_items)
          .update({ quantity: existItem.quantity + 1 })
          .where("cart_id", userCart.id_cart)
          .andWhere("product_id", existItem.product_id)
          .returning("id_cart_item");

        if (!updateItem)
          throw new TransactionError("errors:unable_to_increase_quantity");

        return Number(updateItem.id_cart_item);
      }

      const [addItem] = await trx(EtableNames.cart_items)
        .insert({ ...newProduct, cart_id: userCart.id_cart })
        .returning("id_cart_item");

      if (!addItem) throw new TransactionError("errors:unable_to_add_item");

      return Number(addItem.id_cart_item);
    });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_adding_item", { resource: "cart" });
  }
};
