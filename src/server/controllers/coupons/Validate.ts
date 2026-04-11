import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { CouponService, validateCoupon, calculateDiscount } from "../../services/coupons";
import { validation } from "../../shared/middlewares/Validation";
import { NotFoundError } from "../../errors";

interface IBodyProps {
  code: string;
  order_total_cents: number;
}

export const validateValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      code: yup.string().required(),
      order_total_cents: yup.number().required().integer().min(0),
    }),
  ),
}));

export const validate = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response,
) => {
  const trx = await req.getTenantTrx!();
  const { code, order_total_cents } = req.body;

  const coupon = await CouponService.getByCode(trx, code);
  if (!coupon) {
    throw new NotFoundError("errors:not_found", { resource: "Coupon" });
  }

  validateCoupon(coupon, order_total_cents);
  const discount_cents = calculateDiscount(coupon, order_total_cents);

  return res.status(StatusCodes.OK).json({
    valid: true,
    discount_cents,
    final_total_cents: order_total_cents - discount_cents,
    coupon: {
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value_cents: coupon.discount_value_cents,
    },
  });
};
