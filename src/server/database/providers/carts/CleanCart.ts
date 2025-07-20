import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const cleanCart = async (userId: number): Promise<void | Error> => {
  try {

    //Pegar id do cart relacionado aousuário
    const userCart = await Knex(EtableNames.cart)
      .select('id_cart')
      .where('user_id', userId)
      .first();

    if (!userCart) {
      return new Error(`No items found in cart to delete`);
    }

    const deletedRows: number = await Knex(EtableNames.cart_items).delete().where('cart_id', userCart.id_cart)

    if(deletedRows === 0){
      return new Error(`Cart item not found or unchanged`);
    }

    return;
    
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return new Error(`Database error while cleaning the cart`);
  }
}