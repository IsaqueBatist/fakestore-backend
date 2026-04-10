import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AnalyticsService } from "../../services/analytics";

export const funnel = async (req: Request, res: Response) => {
  const trx = await req.getTenantTrx!();

  const result = await AnalyticsService.getFunnel(trx, req.tenant!.id);

  return res.status(StatusCodes.OK).json(result);
};
