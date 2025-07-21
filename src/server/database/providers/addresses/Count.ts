import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const count = async (filter: string = ''): Promise<number | Error> => {
    try {
      const [{ count }] = await Knex(EtableNames.addresses)
        .where('city', 'like', `%${filter}%`)
        .count<[{count: number}]>('* as count')
      if(Number.isInteger(Number(count))) return Number(count);
      return new Error('Error when querying the total quantity of addresses')  
  } catch (error) {
    console.error(error)
    return new Error('Error when querying the total quantity of addresses');
  }
}