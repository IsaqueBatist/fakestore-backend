import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICategory } from "../../models";

export const updateById = async (categoryId: number, newCategory: Omit<ICategory, 'id_category'>): Promise<void | Error> => {
  try {
    const updatedRows = await Knex(EtableNames.categories).where('id_category', categoryId).update(newCategory)
    
    if(updatedRows > 0) return
    
    return new Error(`Error updating product with id ${categoryId}.`);
  } catch (error) {
    console.error(error)
    return new Error(`Error updating product with id ${categoryId}.`);
  }
}