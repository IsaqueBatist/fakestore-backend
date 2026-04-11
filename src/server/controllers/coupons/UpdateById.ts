import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { CouponService } from "../../services/coupons";
import { validation } from "../../shared/middlewares/Validation";
import { BadRequestError } from "../../errors";

interface IParamProps {
  id?: number;
}

interface IBodyProps {
  code?: string;
  discount_type?: "percentage" | "fixed";
  discount_value_cents?: number;
  min_order_cents?: number;
  max_uses?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  active?: boolean;
}

export const updateByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      id: yup.number().integer().required().moreThan(0),
    }),
  ),
  body: getSchema<IBodyProps>(
    yup.object().shape({
      code: yup.string().optional().min(2).max(50),
      discount_type: yup
        .string()
        .optional()
        .oneOf(["percentage", "fixed"] as const),
      discount_value_cents: yup.number().optional().integer().moreThan(0),
      min_order_cents: yup.number().optional().integer().min(0),
      max_uses: yup.number().optional().nullable().integer().moreThan(0),
      starts_at: yup.string().optional().nullable(),
      expires_at: yup.string().optional().nullable(),
      active: yup.boolean().optional(),
    }),
  ),
}));

export const updateById = async (req: Request<IParamProps>, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError("errors:param_required", { param: "id" });
  }

  const trx = await req.getTenantTrx!();
  await CouponService.updateById(trx, id, req.body);

  return res.status(StatusCodes.NO_CONTENT).send();
};
