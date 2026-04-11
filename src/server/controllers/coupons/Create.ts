import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { CouponService } from "../../services/coupons";
import { validation } from "../../shared/middlewares/Validation";

interface IBodyProps {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value_cents: number;
  min_order_cents?: number;
  max_uses?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
}

export const createValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      code: yup.string().required().min(2).max(50),
      discount_type: yup
        .string()
        .required()
        .oneOf(["percentage", "fixed"] as const),
      discount_value_cents: yup.number().required().integer().moreThan(0),
      min_order_cents: yup.number().optional().integer().min(0).default(0),
      max_uses: yup.number().optional().nullable().integer().moreThan(0),
      starts_at: yup.string().optional().nullable(),
      expires_at: yup.string().optional().nullable(),
    }),
  ),
}));

export const create = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response,
) => {
  const trx = await req.getTenantTrx!();
  const result = await CouponService.create(trx, {
    ...req.body,
    tenant_id: req.tenant!.id,
    active: true,
    min_order_cents: req.body.min_order_cents ?? 0,
    max_uses: req.body.max_uses ?? null,
    starts_at: req.body.starts_at ? new Date(req.body.starts_at) : null,
    expires_at: req.body.expires_at ? new Date(req.body.expires_at) : null,
  });

  return res.status(StatusCodes.CREATED).json(result);
};
