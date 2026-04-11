import { EtableNames } from "../../ETableNames";
import { IProduct } from "../../models";
import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const getByIds = async (
  productIds: number[],
  trx: KnexType.Transaction,
): Promise<Pick<IProduct, "id_product" | "price">[]> => {
  try {
    const result = await trx(EtableNames.products)
      .select("id_product", "price")
      .whereIn("id_product", productIds);

    return result;
  } catch (error) {
    logger.error({ err: error }, "Failed to get products by ids");
    throw new DatabaseError("errors:db_error_getting_all", {
      resource: "products",
    });
  }
};
