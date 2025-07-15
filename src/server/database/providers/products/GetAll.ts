import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct } from "../../models";

export const getAll = async (page: number, limit: number, filter: string, id=0): Promise<IProduct[] | Error> => {
    try {
      const result = await Knex(EtableNames.products)
      .select()
      .where('id', Number(id))
      .orWhere('name', 'like', `%${filter}%`)
      .offset((page-1) * limit)
      .limit(limit)

      if(id>0 && result.every(item => Number(item.id) !== Number(id))){
        const resultById = await Knex(EtableNames.products)
        .select()
        .where('id', id)
        .first()

        if(resultById) return [...result, resultById]
      }
      return result
  } catch (error) {
    console.error(error)
    return new Error('Error getting all products');
  }
}