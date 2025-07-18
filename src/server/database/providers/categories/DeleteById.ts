import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const deleteById = async (categoryId: number): Promise<void | Error> => {
    try {
      const result = await Knex(EtableNames.categories).where('id_category', categoryId).del()
      
      if(result > 0) return;
      
      return new Error(`Category not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Error deleting record with id ${categoryId}`);
  }
}