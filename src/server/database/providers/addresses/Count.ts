import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import { EtableNames } from "../../ETableNames";
import type { Knex as KnexType } from "knex";

export const count = async (
  filter: string = "",
  trx: KnexType.Transaction,
): Promise<number> => {
  try {
    const [{ count }] = await trx(EtableNames.addresses)
      .where("city", "like", `%${filter}%`)
      .count<[{ count: number }]>("* as count");

    const result = Number(count);

    if (Number.isInteger(Number(count))) return result;
    throw new DatabaseError("errors:db_error_count");
  } catch (error) {
    logger.error({ err: error }, "Failed to count addresses");
    if (error instanceof DatabaseError) throw error;

    throw new DatabaseError("errors:db_error_count");
  }
};
