import { CouponProvider } from "../../database/providers/coupons";
import { ICoupon } from "../../database/models/Coupon";
import type { Knex } from "knex";

export const updateById = async (
  trx: Knex.Transaction,
  couponId: number,
  data: Partial<Omit<ICoupon, "id_coupon" | "tenant_id" | "created_at">>,
): Promise<void> => {
  return await CouponProvider.updateById(couponId, data, trx);
};
