import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IPerson } from "../../models/Person";

export const updateById = async (personId: number, newPerson: Omit<IPerson, 'id_person'>): Promise<void | Error> => {
  try {

    const [{count}] = await Knex(EtableNames.products).where('id_product', newPerson.productId).count<[{count: number}]>('* as count')

    if (count === 0) {
      return new Error('Product not found')
    }
    const updatedRows = await Knex(EtableNames.products).where('id_person', personId).update(newPerson)
    
    if(updatedRows > 0) return
    
    return new Error(`Error updating person with id ${personId}.`);
  } catch (error) {
    console.error(error)
    return new Error(`Error updating person with id ${personId}.`);
  }
}