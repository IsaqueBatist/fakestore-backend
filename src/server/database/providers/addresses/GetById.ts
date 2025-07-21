import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IAddress } from "../../models/Addresses";

export const getById = async (addressId: number): Promise<IAddress | Error> => {
  try {
    const result = await Knex(EtableNames.addresses).select().where('id_address', addressId).first()

    if(result) return result

    return new Error(`Address not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while getting address`);
  }
}