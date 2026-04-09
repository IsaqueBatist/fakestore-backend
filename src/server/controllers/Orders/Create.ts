import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OrderService } from "../../services/orders";
import { UnauthorizedError } from "../../errors";

export const create = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  const trx = await req.getTenantTrx!();
  const result = await OrderService.create(trx, req.tenant!.id, userId, req.pendingWebhooks);

  return res.status(StatusCodes.CREATED).json(result);
};
