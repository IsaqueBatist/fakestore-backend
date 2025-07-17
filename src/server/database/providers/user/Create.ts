import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IUser } from "../../models";

export const create = async (user: Omit<IUser, 'id_user'>): Promise<number | Error> => {
  try {
    const [result] = await Knex(EtableNames.user).insert(user).returning('id_user')
    return Number(result.id_user)
  } catch (error) {
    //TODO: Adicionar monitoramento de log
    console.error(error)
    return new Error('Error registering record');
  }
}