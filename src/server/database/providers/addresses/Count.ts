import { DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const count = async (filter: string = ""): Promise<number> => {
  try {
    const [{ count }] = await Knex(EtableNames.addresses)
      .where("city", "like", `%${filter}%`)
      .count<[{ count: number }]>("* as count");

    const result = Number(count);

    if (Number.isInteger(Number(count))) return result;
    throw new DatabaseError("errors:db_error_count");
  } catch (error) {
    console.error(error);
    if (error instanceof DatabaseError) throw error;

    throw new DatabaseError("errors:db_error_count");
  }
};
