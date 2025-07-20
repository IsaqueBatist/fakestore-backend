import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICart_Item } from "../../models/Cart_Item";

export const updateItem = async (newProduct: Omit<ICart_Item, 'id_cart_item' | 'added_at' | 'cart_id' | 'product_id'>, userId: number, productId: number): Promise<void | Error> => {
  try {

    //Pegar id do cart relacionado aousuário
    const userCart = await Knex(EtableNames.cart)
      .select('id_cart')
      .where('user_id', userId)
      .first();

    if (!userCart) {
      return new Error(`Cart not found for user`);
    }


    const result = await Knex(EtableNames.cart_items).update({...newProduct, cart_id: userCart.id_cart}).where('cart_id', userCart.id_cart).andWhere('product_id', productId)

    if(result === 0){
      return new Error(`Cart item not found or unchanged`);
    }

    return
  } catch (error) {
    console.error(error)
    return new Error(`Database error while add item to cart`);
  }
}