import { EtableNames } from "../../ETableNames";
import { ICoupon } from "../../models/Coupon";
import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const getByCode = async (
  code: string,
  trx: KnexType.Transaction,
): Promise<ICoupon | undefined> => {
  try {
    return await trx(EtableNames.coupons)
      .select()
      .whereRaw("UPPER(code) = UPPER(?)", [code])
      .first();
  } catch (error) {
    logger.error({ err: error }, "Failed to get coupon by code");
    throw new DatabaseError("errors:db_error_getting_all", {
      resource: "coupon",
    });
  }
};
