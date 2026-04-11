import { CouponProvider } from "../../database/providers/coupons";
import { ICoupon } from "../../database/models/Coupon";
import type { Knex } from "knex";

export const getByCode = async (
  trx: Knex.Transaction,
  code: string,
): Promise<ICoupon | undefined> => {
  return await CouponProvider.getByCode(code, trx);
};
