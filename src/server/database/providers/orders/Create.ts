import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder_Item } from "../../models";

export const create = async (userId: number): Promise<number | Error> => {
  try {
    const userCart = await Knex(EtableNames.cart)
    .select()
    .where('user_id', userId)
    .first()

    if(!userCart) return new Error('Cart not found')

    const [newOrder] = await Knex(EtableNames.orders).insert({total: 0, user_id: userId}).returning('id_order')

    const cartItems = await Knex(EtableNames.cart_items)
    .select()
    .where('cart_id', userCart.id_cart)

    const productsId: number[] = cartItems.map((cItem) => Number(cItem.product_id))

    const products = await Knex(EtableNames.products)
    .select('id_product', 'price')
    .whereIn('id_product', productsId)

    if (products.length !== cartItems.length) {
      throw new Error('Some products were not found');
    }

    const priceMap = new Map(
      products.map(p => [p.id_product, p.price])
    )

    const orederItems: Omit<IOrder_Item, 'id_order_item'>[] = cartItems.map(cartItem => ({
      order_id: newOrder.id_order,
      product_id: cartItem.product_id,
      quantity: cartItem.quantity,
      unt_price: priceMap.get(cartItem.product_id) ?? 0, 
    }))

    const addOrderItems = await Knex(EtableNames.order_items)
    .insert(orederItems)

    if(!addOrderItems) return new Error('Error while add items from cart to order')

    //Calcular total

    const updatedItems = await Knex(EtableNames.order_items)
    .select('quantity', 'unt_price')
    .where('order_id', newOrder.id_order);

    const newTotal = updatedItems.reduce((acc, item) => acc + item.quantity * item.unt_price, 0);

    const updatedTotal = await Knex(EtableNames.orders)
    .update({total: newTotal})
    .where('id_order', newOrder.id_order);

    if(!updatedTotal) return new Error('Unable to recalculate total')
    
    //Limpar carrinho
    await Knex(EtableNames.cart_items)
    .where('cart_id', userCart.id_cart)
    .del()

    return newOrder.id_order
  } catch (error) {
    //TODO: Adicionar monitoramento de log
    console.error(error)
    return new Error('Error registering record');
  }
}