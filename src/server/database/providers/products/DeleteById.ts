import { EtableNames } from "../../ETableNames";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const deleteById = async (
  productId: number,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const result = await trx(EtableNames.products)
      .where("id_product", productId)
      .del();

    if (result > 0) return;

    throw new NotFoundError("errors:not_found", { resource: "Product" });
  } catch (error) {
    logger.error({ err: error }, "Failed to delete product by id");
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_deleting", { resource: "record" });
  }
};
