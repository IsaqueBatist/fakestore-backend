import { Knex } from '../../knex';
import { EtableNames } from '../../ETableNames';

export const count = async (filter: string = ''): Promise<number | Error> => {
  try {
    const [{ count }] = await Knex(EtableNames.person)
      .modify((qb) => {
        if (filter) {
          qb.whereRaw("firstname + ' ' + lastname LIKE ?", [`%${filter}%`]);
        }
      })
      .count<[{ count: number }]>("* as count");

    const total = Number(count);
    if (Number.isInteger(total)) return total;

    return new Error('Error when querying the total quantity of people');
  } catch (error) {
    console.error(error);
    return new Error('Error when querying the total quantity of people');
  }
};
