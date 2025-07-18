import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICategory } from "../../models";

export const create = async (category: Omit<ICategory, 'id_category'>): Promise<number | Error> => {
  try {
    const [result] = await Knex(EtableNames.categories).insert(category).returning('id_category')
    return Number(result.id_category)
  } catch (error) {
    //TODO: Adicionar monitoramento de log
    console.error(error)
    return new Error('Error registering record');
  }
}