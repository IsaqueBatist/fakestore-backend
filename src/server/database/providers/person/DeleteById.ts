import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const deleteById = async (personId: number): Promise<void | Error> => {
    try {
      const result = await Knex(EtableNames.person).where('id_person', personId).del()
      
      if(result > 0) return;
      
      return new Error(`Person not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Error deleting record with id ${personId}`);
  }
}