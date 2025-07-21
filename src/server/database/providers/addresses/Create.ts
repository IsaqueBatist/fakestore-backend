import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IAddress } from "../../models/Addresses";

export const create = async (address: Omit<IAddress, 'id_address' | 'user_id'>, user_id: number): Promise<number | Error> => {
  try {
    const [result] = await Knex(EtableNames.addresses).insert({...address, user_id}).returning('id_address')
    return Number(result.id_address)
  } catch (error) {
    //TODO: Adicionar monitoramento de log
    console.error(error)
    return new Error('Error registering record');
  }
}