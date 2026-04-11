import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import { EtableNames } from "../../ETableNames";
import { IProduct } from "../../models";
import type { Knex as KnexType } from "knex";

export const create = async (
  product: Omit<IProduct, "id_product">,
  trx: KnexType.Transaction,
): Promise<number | Error> => {
  try {
    const [result] = await trx(EtableNames.products)
      .insert(product)
      .returning("id_product");
    return Number(result.id_product);
  } catch (error) {
    logger.error({ err: error }, "Failed to create product");
    throw new DatabaseError("errors:db_error_registering");
  }
};
