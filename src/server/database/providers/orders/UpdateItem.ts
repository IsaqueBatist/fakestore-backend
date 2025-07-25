import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder_Item } from "../../models";

export const updateItem = async (
  newProduct: Omit<IOrder_Item, 'id_order_item' | 'order_id'>, 
  userId: number, 
  productId: number): Promise<void | Error> => {
  try {

    const userOrder = await Knex(EtableNames.orders)
      .select()
      .where('user_id', userId)
      .first();

    if (!userOrder) {
      return new Error(`Order not found for user`);
    }

    if(userOrder.user_id !== userId) return new Error('You cant update this order')

    const result = await Knex(EtableNames.order_items).update({...newProduct, order_id: userOrder.id_order}).where('order_id', userOrder.id_order).andWhere('product_id', productId)

    if(result === 0){
      return new Error(`Order item not found or unchanged`);
    }

    return
  } catch (error) {
    console.error(error)
    return new Error(`Database error while add item to cart`);
  }
}