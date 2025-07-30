import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder } from "../../models/Order";

export const getById = async (orderId: number, userId: number): Promise<IOrder | Error> => {
  try {
    const result = await Knex(EtableNames.orders).select().where('id_order', orderId).first()

    if(!result) return new Error('Order not found')

    if(Number(result.user_id) !== userId) return new Error('You cant get this order')

    return result
  } catch (error) {
    console.error(error)
    return new Error(`Database error while getting order`);
  }
}