import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICart_Item } from "../../models/Cart_Item";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const updateItem = async (
  newProduct: Omit<
    ICart_Item,
    "id_cart_item" | "added_at" | "cart_id" | "product_id"
  >,
  userId: number,
  productId: number,
): Promise<void> => {
  try {
    //Pegar id do cart relacionado aousuário
    const userCart = await Knex(EtableNames.cart)
      .select("id_cart")
      .where("user_id", userId)
      .first();

    if (!userCart) {
      throw new NotFoundError(`Cart`);
    }

    const result = await Knex(EtableNames.cart_items)
      .update({ ...newProduct, cart_id: userCart.id_cart })
      .where("cart_id", userCart.id_cart)
      .andWhere("product_id", productId);

    if (result === 0) {
      throw new NotFoundError(`Cart item`);
    }

    return;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Database error while add item to cart`);
  }
};
