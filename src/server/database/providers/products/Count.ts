import { DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const count = async (filter: string = ""): Promise<number> => {
  try {
    const [{ count }] = await Knex(EtableNames.products)
      .where("name", "like", `%${filter}%`)
      .count<[{ count: number }]>("* as count");

    if (Number.isInteger(Number(count))) return Number(count);

    throw new DatabaseError(
      "Error when querying the total quantity of categories",
    );
  } catch (error) {
    console.error(error);
    if (error instanceof DatabaseError) throw error;

    throw new DatabaseError("Internal database error during count operation");
  }
};
