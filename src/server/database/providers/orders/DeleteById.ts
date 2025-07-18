import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const deleteById = async (orderId: number): Promise<void | Error> => {
    try {
      const result = await Knex(EtableNames.orders).where('id_order', orderId).del()
      
      if(result > 0) return;
      
      return new Error(`Order not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Error deleting record`);
  }
}