import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder_Item } from "../../models/Order_item";
//TODO: Verificar se o item já existe
export const addedItem = async (newProduct: Omit<IOrder_Item, 'id_order_item' | 'order_id'>, userId: number): Promise<number | Error> => {
  try {

    const order = await Knex(EtableNames.orders)
      .select()
      .where('user_id', userId)
      .first();

    if (!order) {
      return new Error(`Order not found for user`);
    }

    const [result] = await Knex(EtableNames.order_items).insert({...newProduct, order_id: order.id_order, }).returning('id_order_item')

    if(result) return Number(result.id_order_item)

    return new Error(`Cart not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while add item to order`);
  }
}