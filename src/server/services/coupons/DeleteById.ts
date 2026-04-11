import { CouponProvider } from "../../database/providers/coupons";
import type { Knex } from "knex";

export const deleteById = async (
  trx: Knex.Transaction,
  couponId: number,
): Promise<void> => {
  return await CouponProvider.deleteById(couponId, trx);
};
