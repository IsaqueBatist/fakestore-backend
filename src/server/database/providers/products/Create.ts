import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct } from "../../models";

export const create = async (product: Omit<IProduct, 'id'>): Promise<number | Error> => {
  try {
    const [id] = await Knex(EtableNames.products).insert(product).returning('id')
    return id
  } catch (error) {
    //TODO: Adicionar monitoramento de log
    console.error(error)
    return new Error('Error registering record');
  }
}