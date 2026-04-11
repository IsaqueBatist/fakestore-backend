import { EtableNames } from "../../ETableNames";
import { ICategory } from "../../models";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const getById = async (
  categoryId: number,
  trx: KnexType.Transaction,
): Promise<ICategory> => {
  try {
    const result = await trx(EtableNames.categories)
      .select()
      .where("id_category", categoryId)
      .first();

    if (result) return result;

    throw new NotFoundError("errors:not_found", { resource: "Category" });
  } catch (error) {
    logger.error({ err: error }, "Failed to get category by id");
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_getting", {
      resource: "category",
    });
  }
};
