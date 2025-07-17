import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IUser } from "../../models";

export const getByEmail = async (userEmail: string): Promise<IUser | Error> => {
  try {
    const result = await Knex(EtableNames.user).select().where('email', userEmail).first()

    if(result) return result

    return new Error(`User not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while getting user with email ${userEmail}`);
  }
}