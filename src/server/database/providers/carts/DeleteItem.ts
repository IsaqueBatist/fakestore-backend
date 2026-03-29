import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const deleteItem = async (
  userId: number,
  productId: number,
): Promise<void> => {
  try {
    //Pegar id do cart relacionado ao usuário
    const userCart = await Knex(EtableNames.cart)
      .select("id_cart")
      .where("user_id", userId)
      .first();

    if (!userCart) {
      throw new NotFoundError(`Cart`);
    }

    const deletedRows: number = await Knex(EtableNames.cart_items)
      .delete()
      .where("cart_id", userCart.id_cart)
      .andWhere("product_id", productId);

    if (deletedRows === 0) {
      throw new NotFoundError(`Cart item`);
    }

    return;
  } catch (error) {
    console.error("Error deleting cart item:", error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Database error while deleting item from cart`);
  }
};
