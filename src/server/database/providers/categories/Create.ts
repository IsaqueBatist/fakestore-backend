import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import { EtableNames } from "../../ETableNames";
import { ICategory } from "../../models";
import type { Knex as KnexType } from "knex";

export const create = async (
  category: Omit<ICategory, "id_category">,
  trx: KnexType.Transaction,
): Promise<number | Error> => {
  try {
    const [result] = await trx(EtableNames.categories)
      .insert(category)
      .returning("id_category");
    return Number(result.id_category);
  } catch (error) {
    logger.error({ err: error }, "Failed to create category");
    throw new DatabaseError("errors:db_error_registering");
  }
};
