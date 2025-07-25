import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICart_Item } from "../../models/Cart_Item";

export const addItem = async (newProduct: Omit<ICart_Item, 'id_cart_item' | 'added_at' | 'cart_id'>, userId: number): Promise<number | Error> => {
  try {

    const userCart = await Knex(EtableNames.cart)
      .select('id_cart')
      .where('user_id', userId)
      .first();

    if (!userCart) {
      return new Error(`Cart not found for user`);
    }

    const product = await Knex(EtableNames.products)
    .select()
    .where('id_product', newProduct.product_id)
    .first()

    if(!product) return new Error('Non-existent Product')

    const cartItems = await Knex(EtableNames.cart_items)
    .select()
    .where('cart_id', userCart.id_cart)

    if(!cartItems) return new Error('Unable to get cart items')

    const existItem = cartItems.find((p) => Number(p.product_id) === Number(newProduct.product_id))

    if(existItem){
      const [updateItem] = await Knex(EtableNames.cart_items)
      .update({quantity: existItem.quantity + 1})
      .where('cart_id', userCart.id_cart )
      .andWhere('product_id', existItem.product_id)
      .returning('id_cart_item')

      if(!updateItem) return new Error('Unable to increase item quantity')
      
      return Number(updateItem.id_cart_item)
    }

    const [addItem] = await Knex(EtableNames.cart_items)
    .insert({...newProduct, cart_id: userCart.id_cart})
    .returning('id_cart_item')

    if(!addItem) return new Error('Ubale to add item to cart')
    
    return Number(addItem.id_cart_item)
    
  } catch (error) {
    console.error(error)
    return new Error(`Database error while add item to cart`);
  }
}