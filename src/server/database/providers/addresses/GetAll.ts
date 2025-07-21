import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IAddress } from "../../models/Addresses";

export const getAll = async (page: number, limit: number, filter: string, id=0): Promise<IAddress[] | Error> => {
    try {
      const result = await Knex(EtableNames.addresses)
      .select()
      .where('id_address', Number(id))
      .orWhere('city', 'like', `%${filter}%`)
      .offset((page-1) * limit)
      .limit(limit)

      if(id>0 && result.every(item => Number(item.id_address) !== Number(id))){
        const resultById = await Knex(EtableNames.addresses)
        .select()
        .where('id_address', id)
        .first()

        if(resultById) return [...result, resultById]
      }
      return result
  } catch (error) {
    console.error(error)
    return new Error('Error getting all addresses');
  }
}