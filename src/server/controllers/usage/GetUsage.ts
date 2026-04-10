import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UsageService } from "../../services/usage";

export const getUsage = async (req: Request, res: Response) => {
  const result = await UsageService.getUsage(
    req.tenant!.id,
    req.tenant!.plan,
    req.tenant!.rateLimit,
  );

  return res.status(StatusCodes.OK).json(result);
};
