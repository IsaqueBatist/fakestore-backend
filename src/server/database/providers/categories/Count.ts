import { DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import type { Knex as KnexType } from "knex";

export const count = async (filter: string = "", trx?: KnexType.Transaction): Promise<number> => {
  try {
    const conn = trx ?? Knex;
    const [{ count }] = await conn(EtableNames.categories)
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
