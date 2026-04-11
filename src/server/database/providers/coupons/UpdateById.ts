import { EtableNames } from "../../ETableNames";
import { ICoupon } from "../../models/Coupon";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const updateById = async (
  couponId: number,
  data: Partial<Omit<ICoupon, "id_coupon" | "tenant_id" | "created_at">>,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const updatedRows = await trx(EtableNames.coupons)
      .where("id_coupon", couponId)
      .update(data);

    if (updatedRows > 0) return;

    throw new NotFoundError("errors:not_found", { resource: "Coupon" });
  } catch (error) {
    logger.error({ err: error }, "Failed to update coupon by id");
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_updating", {
      resource: "coupon",
    });
  }
};
