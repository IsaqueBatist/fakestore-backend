import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder } from "../../models/Order";

export const getByUserId = async (orderId: number): Promise<IOrder | Error> => {
  try {
    const result = await Knex(EtableNames.orders).select().where('user_id', orderId).first()

    if(result) return result

    return new Error(`Order not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while getting order`);
  }
}