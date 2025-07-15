import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const deleteById = async (productId: number): Promise<void | Error> => {
    try {
      await Knex(EtableNames.products).where('id', productId).del()
      return
  } catch (error) {
    console.error(error)
    return new Error('Error deleting record');
  }
}