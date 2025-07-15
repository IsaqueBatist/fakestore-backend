import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct } from "../../models";

export const getAll = async (): Promise<IProduct[] | Error> => {
    try {
      const result = await Knex.select().table(EtableNames.products)
      return result
  } catch (error) {
    console.error(error)
    return new Error('Error getting all products');
  }
}