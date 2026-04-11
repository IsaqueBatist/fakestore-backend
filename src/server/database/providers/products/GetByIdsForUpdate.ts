import { EtableNames } from "../../ETableNames";
import { IProduct } from "../../models";
import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const getByIdsForUpdate = async (
  productIds: number[],
  trx: KnexType.Transaction,
): Promise<Pick<IProduct, "id_product" | "price" | "stock" | "name">[]> => {
  try {
    // Sort IDs to acquire locks in deterministic order, preventing deadlocks
    const sortedIds = [...productIds].sort((a, b) => a - b);

    const result = await trx(EtableNames.products)
      .select("id_product", "price", "stock", "name")
      .whereIn("id_product", sortedIds)
      .orderBy("id_product", "asc")
      .forUpdate();

    return result;
  } catch (error) {
    logger.error({ err: error }, "Failed to get products by ids for update");
    throw new DatabaseError("errors:db_error_getting_all", {
      resource: "products",
    });
  }
};
