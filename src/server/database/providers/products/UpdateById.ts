import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct } from "../../models";

export const updateById = async (productId: number, newProduct: Omit<IProduct, 'id'>): Promise<void | Error> => {
  try {
    const updatedRows = await Knex(EtableNames.products).where('id', productId).update(newProduct)
    
    if(updatedRows > 0) return
    
    return new Error(`Error updating product with id ${productId}.`);
  } catch (error) {
    console.error(error)
    return new Error(`Error updating product with id ${productId}.`);
  }
}