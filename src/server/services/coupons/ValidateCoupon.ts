import { ICoupon } from "../../database/models/Coupon";
import { BadRequestError } from "../../errors/BadRequestError";

export function validateCoupon(coupon: ICoupon, orderTotalCents: number): void {
  // Check if active
  if (!coupon.active) throw new BadRequestError("coupons:inactive");

  // Check dates
  const now = new Date();
  if (coupon.starts_at && now < new Date(coupon.starts_at))
    throw new BadRequestError("coupons:not_started");
  if (coupon.expires_at && now > new Date(coupon.expires_at))
    throw new BadRequestError("coupons:expired");

  // Check uses
  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses)
    throw new BadRequestError("coupons:max_uses_reached");

  // Check minimum order
  if (orderTotalCents < coupon.min_order_cents)
    throw new BadRequestError("coupons:min_order_not_met");
}

// CRITICAL: Use Math.floor for percentage discounts to avoid floating-point issues
export function calculateDiscount(
  coupon: ICoupon,
  orderTotalCents: number,
): number {
  if (coupon.discount_type === "percentage") {
    // discount_value_cents for percentage means basis points: 1500 = 15.00%
    return Math.floor((orderTotalCents * coupon.discount_value_cents) / 10000);
  }
  // Fixed discount in cents
  return Math.min(coupon.discount_value_cents, orderTotalCents);
}
