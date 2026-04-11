import { EtableNames } from "../../ETableNames";
import { IProduct } from "../../models";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const getById = async (
  productId: number,
  trx: KnexType.Transaction,
): Promise<IProduct> => {
  try {
    const result = await trx(EtableNames.products)
      .select()
      .where("id_product", productId)
      .first();

    if (result) return result;

    throw new NotFoundError("errors:not_found", { resource: "Product" });
  } catch (error) {
    logger.error({ err: error }, "Failed to get product by id");
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_getting", { resource: "product" });
  }
};
