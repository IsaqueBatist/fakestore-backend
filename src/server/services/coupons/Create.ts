import { CouponProvider } from "../../database/providers/coupons";
import { ICoupon } from "../../database/models/Coupon";
import type { Knex } from "knex";

export const create = async (
  trx: Knex.Transaction,
  coupon: Omit<ICoupon, "id_coupon" | "current_uses" | "created_at">,
): Promise<number> => {
  return await CouponProvider.create(coupon, trx);
};
