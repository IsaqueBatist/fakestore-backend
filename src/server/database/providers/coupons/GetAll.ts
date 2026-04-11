import { EtableNames } from "../../ETableNames";
import { ICoupon } from "../../models/Coupon";
import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const getAll = async (
  trx: KnexType.Transaction,
  active?: boolean,
): Promise<ICoupon[]> => {
  try {
    const query = trx(EtableNames.coupons)
      .select()
      .orderBy("id_coupon", "asc");

    if (active !== undefined) {
      query.where("active", active);
    }

    return await query;
  } catch (error) {
    logger.error({ err: error }, "Failed to get all coupons");
    throw new DatabaseError("errors:db_error_getting_all", {
      resource: "coupons",
    });
  }
};
