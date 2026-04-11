import { CouponProvider } from "../../database/providers/coupons";
import type { Knex } from "knex";

export const incrementUses = async (
  trx: Knex.Transaction,
  couponId: number,
): Promise<void> => {
  return await CouponProvider.incrementUses(couponId, trx);
};
