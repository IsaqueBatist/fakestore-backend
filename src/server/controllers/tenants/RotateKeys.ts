import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { TenantService } from "../../services/tenants";

export const rotateKeys = async (req: Request, res: Response) => {
  const result = await TenantService.rotateKeys({
    tenantId: req.tenant!.id,
    currentApiKey: req.headers["x-api-key"] as string,
  });

  return res.status(StatusCodes.OK).json(result);
};
