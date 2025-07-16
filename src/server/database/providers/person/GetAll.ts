import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IPerson } from "../../models/Person";

export const getAll = async (page: number, limit: number, filter: string): Promise<IPerson[] | Error> => {
    try {
        const query = Knex(EtableNames.person)
            .select('*')
            .where((builder) => {
                if (filter) {
                    builder.orWhere(
                        Knex.raw("CONCAT(firstname, ' ', lastname) LIKE ?", [`%${filter}%`])
                    );
                }
            })
            .offset((page - 1) * limit)
            .limit(limit);
        const result = await query;
        return result;
    } catch (error) {
        console.error(error);
        return new Error('Error getting all people');
    }
};