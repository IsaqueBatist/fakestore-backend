import { DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const count = async (filter: string = ""): Promise<number> => {
  try {
    const [{ count }] = await Knex(EtableNames.categories)
      .where("name", "like", `%${filter}%`)
      .count<[{ count: number }]>("* as count");
    if (Number.isInteger(Number(count))) return Number(count);
    throw new DatabaseError("errors:db_error_count");
  } catch (error) {
    console.error(error);
    if (error instanceof DatabaseError) throw error;

    throw new DatabaseError("errors:db_error_count");
  }
};
