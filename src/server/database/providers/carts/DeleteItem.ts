import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const deleteItem = async (userId: number, productId: number): Promise<void | Error> => {
  try {

    //Pegar id do cart relacionado aousuário
    const userCart = await Knex(EtableNames.cart)
      .select('id_cart')
      .where('user_id', userId)
      .first();

    if (!userCart) {
      return new Error(`Cart not found for user`);
    }

    const deletedRows: number = await Knex(EtableNames.cart_items).delete().where('cart_id', userCart.id_cart).andWhere('product_id', productId)

    if(deletedRows === 0){
      return new Error(`Cart item not found or unchanged`);
    }

    return
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return new Error(`Database error while deleting item from cart`);
  }
}