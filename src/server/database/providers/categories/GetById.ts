import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICategory } from "../../models";

export const getById = async (categortId: number): Promise<ICategory | Error> => {
  try {
    const result = await Knex(EtableNames.categories).select().where('id_category', categortId).first()

    if(result) return result

    return new Error(`Category not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while getting category with id ${categortId}`);
  }
}