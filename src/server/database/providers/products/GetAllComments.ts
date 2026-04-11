import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import { EtableNames } from "../../ETableNames";
import { IProduct_Comment } from "../../models";
import type { Knex as KnexType } from "knex";

export const getAllComments = async (
  productId: number,
  trx: KnexType.Transaction,
): Promise<IProduct_Comment[] | Error> => {
  try {
    const result = await trx(EtableNames.product_comments)
      .select()
      .where("product_id", productId);

    return result;
  } catch (error) {
    logger.error({ err: error }, "Failed to get all product comments");
    throw new DatabaseError("errors:db_error_getting_all", {
      resource: "product categories",
    });
  }
};
