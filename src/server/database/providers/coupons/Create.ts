import { EtableNames } from "../../ETableNames";
import { ICoupon } from "../../models/Coupon";
import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const create = async (
  coupon: Omit<ICoupon, "id_coupon" | "current_uses" | "created_at">,
  trx: KnexType.Transaction,
): Promise<number> => {
  try {
    const [result] = await trx(EtableNames.coupons)
      .insert(coupon)
      .returning("id_coupon");
    return typeof result === "object" ? result.id_coupon : result;
  } catch (error) {
    logger.error({ err: error }, "Failed to create coupon");
    throw new DatabaseError("errors:db_error_registering");
  }
};
