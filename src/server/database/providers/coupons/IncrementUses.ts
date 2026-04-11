import { EtableNames } from "../../ETableNames";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const incrementUses = async (
  couponId: number,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const updatedRows = await trx(EtableNames.coupons)
      .where("id_coupon", couponId)
      .increment("current_uses", 1);

    if (updatedRows > 0) return;

    throw new NotFoundError("errors:not_found", { resource: "Coupon" });
  } catch (error) {
    logger.error({ err: error }, "Failed to increment coupon uses");
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_updating", {
      resource: "coupon",
    });
  }
};
