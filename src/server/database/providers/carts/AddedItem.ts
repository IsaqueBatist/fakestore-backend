import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICart_Item } from "../../models/Cart_Item";

export const addedItem = async (newProduct: Omit<ICart_Item, 'id_cart_item' | 'added_at' | 'cart_id'>, userId: number): Promise<number | Error> => {
  try {

    const userCart = await Knex(EtableNames.cart)
      .select('id_cart')
      .where('user_id', userId)
      .first();

    if (!userCart) {
      return new Error(`Cart not found for user`);
    }

    const [result] = await Knex(EtableNames.cart_items).insert({...newProduct, cart_id: userCart.id_cart}).returning('id_cart_item')

    if(result) return Number(result.id_cart_item)

    return new Error(`Cart not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while add item to cart`);
  }
}