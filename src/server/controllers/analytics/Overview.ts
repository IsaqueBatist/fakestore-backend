import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { AnalyticsService } from "../../services/analytics";

interface IQueryProps {
  period?: string;
}

export const overviewValidation = validation((getSchema) => ({
  query: getSchema<IQueryProps>(
    yup.object().shape({
      period: yup
        .string()
        .oneOf(["7d", "30d", "90d"])
        .default("30d")
        .optional(),
    }),
  ),
}));

export const overview = async (req: Request, res: Response) => {
  const trx = await req.getTenantTrx!();
  const period = (req.query.period as string) || "30d";

  const result = await AnalyticsService.getOverview(
    trx,
    req.tenant!.id,
    period,
  );

  return res.status(StatusCodes.OK).json(result);
};
