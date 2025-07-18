import { passwordCrypto } from "../../../shared/services";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IUser } from "../../models";

export const create = async (user: Omit<IUser, 'id_user'>): Promise<number | Error> => {
  try {
    const hasedPassword = await passwordCrypto.hashPassowrd(user.password_hash);

    const [result] = await Knex(EtableNames.user).insert({...user, password_hash: hasedPassword}).returning('id_user')
    return Number(result.id_user)
  } catch (error) {
    //TODO: Adicionar monitoramento de log
    console.error(error)
    return new Error('Error registering record');
  }
}