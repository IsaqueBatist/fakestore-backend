import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct } from "../../models";
import { IPerson } from "../../models/Person";

export const create = async (person: Omit<IPerson, 'id_person'>): Promise<number | Error> => {
  try {
    const [{count}] = await Knex(EtableNames.products).where('id_product', person.productId).count<[{count: number}]>('* as count')

    if (count === 0) {
      return new Error('Product not found')
    }
    const [result] = await Knex(EtableNames.person).insert(person).returning('id_person')
    return Number(result.id_person)
  } catch (error) {
    //TODO: Adicionar monitoramento de log
    console.error(error)
    return new Error('Error registering record');
  }
}