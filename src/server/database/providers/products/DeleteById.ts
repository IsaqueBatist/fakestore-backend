import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const deleteById = async (productId: number): Promise<void | Error> => {
    try {
      const result = await Knex(EtableNames.products).where('id', productId).del()
      
      if(result > 0) return;
      
      return new Error(`Product not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Error deleting record with id ${productId}`);
  }
}