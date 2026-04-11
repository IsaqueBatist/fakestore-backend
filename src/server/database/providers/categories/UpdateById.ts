import { EtableNames } from "../../ETableNames";
import { ICategory } from "../../models";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const updateById = async (
  categoryId: number,
  newCategory: Omit<ICategory, "id_category">,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const updatedRows = await trx(EtableNames.categories)
      .where("id_category", categoryId)
      .update(newCategory);

    if (updatedRows > 0) return;

    throw new NotFoundError("errors:not_found", { resource: "Category" });
  } catch (error) {
    logger.error({ err: error }, "Failed to update category by id");
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_updating", {
      resource: "category",
    });
  }
};
