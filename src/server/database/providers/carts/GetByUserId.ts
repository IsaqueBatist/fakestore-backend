import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICart } from "../../models";

export const getByUserId = async (userId: number): Promise<ICart | Error> => {
  try {
    const result = await Knex(EtableNames.cart).select().where('user_id', userId).first()

    if(result) return result

    return new Error(`Cart not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while getting cart`);
  }
}