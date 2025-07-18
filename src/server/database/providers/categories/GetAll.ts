import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICategory } from "../../models";

export const getAll = async (page: number, limit: number, filter: string, id=0): Promise<ICategory[] | Error> => {
    try {
      const result = await Knex(EtableNames.categories)
      .select()
      .where('id_category', Number(id))
      .orWhere('name', 'like', `%${filter}%`)
      .offset((page-1) * limit)
      .limit(limit)

      if(id>0 && result.every(item => Number(item.id_category) !== Number(id))){
        const resultById = await Knex(EtableNames.categories)
        .select()
        .where('id_category', id)
        .first()

        if(resultById) return [...result, resultById]
      }
      return result
  } catch (error) {
    console.error(error)
    return new Error('Error getting all categories');
  }
}