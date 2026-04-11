import { CouponProvider } from "../../database/providers/coupons";
import { ICoupon } from "../../database/models/Coupon";
import type { Knex } from "knex";

export const getAll = async (
  trx: Knex.Transaction,
  active?: boolean,
): Promise<ICoupon[]> => {
  return await CouponProvider.getAll(trx, active);
};
