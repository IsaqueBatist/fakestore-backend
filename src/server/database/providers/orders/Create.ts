import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder } from "../../models/Order";

export const create = async (order: Omit<IOrder, 'id_order' | 'created_at'>): Promise<number | Error> => {
  try {
    const [result] = await Knex(EtableNames.orders).insert(order).returning('id_order')
    return Number(result.id_order)
  } catch (error) {
    //TODO: Adicionar monitoramento de log
    console.error(error)
    return new Error('Error registering record');
  }
}