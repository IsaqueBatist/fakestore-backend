import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder } from "../../models/Order";

export const updateByUserId = async (orderId: number, newOrder: Omit<IOrder, 'id_order' | 'created_at'>): Promise<void | Error> => {
  try {
    const updatedRows = await Knex(EtableNames.orders).where('id_order', orderId).update(newOrder)
    
    if(updatedRows > 0) return
    
    return new Error(`Error updating order.`);
  } catch (error) {
    console.error(error)
    return new Error(`Error updating order.`);
  }
}