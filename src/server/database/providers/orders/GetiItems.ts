import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder_Item } from "../../models";

export const getItems = async (userId: number, orderId: number): Promise<IOrder_Item[] | Error> => {
  try {

    const result = await Knex(EtableNames.orders).select().where('user_id', userId).andWhere('id_order', orderId).first()

    if(!result) return new Error('User dont have an order')    

    const items = await Knex(EtableNames.order_items).select().where('order_id', result.id_order)

    if(items) return items

    return new Error(`Items not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while getting order items`);
  }
}