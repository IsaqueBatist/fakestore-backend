import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IPerson } from "../../models/Person";

export const getById = async (personId: number): Promise<IPerson | Error> => {
  try {
    const result = await Knex(EtableNames.person).select().where('id_person', personId).first()

    if(result) return result

    return new Error(`Person not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while getting person with id ${personId}`);
  }
}