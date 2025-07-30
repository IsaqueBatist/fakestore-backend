import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder_Item } from "../../models";

export const updateItem = async (
  newProduct: Omit<IOrder_Item, 'id_order_item' | 'order_id'>, 
  userId: number, 
  productId: number,
  orderId: number): Promise<void | Error> => {
  
  try {

    const userOrder = await Knex(EtableNames.orders)
      .select()
      .where('user_id', userId)
      .andWhere('id_order', orderId)
      .first();

    if (!userOrder) {
      return new Error(`Order not found for user`);
    }

    if(Number(userOrder.user_id) !== userId) return new Error('You cant update this order')

    const result = await Knex(EtableNames.order_items)
    .update({...newProduct, order_id: userOrder.id_order})
    .where('order_id', userOrder.id_order)
    .andWhere('product_id', productId)

    if(result === 0){
      return new Error(`Order item not found or unchanged`);
    }

    //Recalcular order

    const updatedItems = await Knex(EtableNames.order_items)
    .select('quantity', 'unt_price')
    .where('order_id', userOrder.id_order);

    const newTotal = updatedItems.reduce((acc, item) => acc + item.quantity * item.unt_price, 0);

    const updatedTotal = await Knex(EtableNames.orders)
    .update({total: newTotal})
    .where('id_order', userOrder.id_order);

    if(!updatedTotal) return new Error('Unable to recalculate total')


    return
  } catch (error) {
    console.error(error)
    return new Error(`Database error while add item to cart`);
  }
}