import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { CouponService } from "../../services/coupons";
import { validation } from "../../shared/middlewares/Validation";

interface IQueryProps {
  active?: string;
}

export const getAllValidation = validation((getSchema) => ({
  query: getSchema<IQueryProps>(
    yup.object().shape({
      active: yup.string().optional().oneOf(["true", "false"]),
    }),
  ),
}));

export const getAll = async (
  req: Request<{}, {}, {}, IQueryProps>,
  res: Response,
) => {
  const trx = await req.getTenantTrx!();

  const active =
    req.query.active !== undefined
      ? req.query.active === "true"
      : undefined;

  const result = await CouponService.getAll(trx, active);

  return res.status(StatusCodes.OK).json(result);
};
