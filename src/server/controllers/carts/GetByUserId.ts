import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UnauthorizedError } from "../../errors";
import { CartService } from "../../services/carts";

export const getByUserId = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  const trx = await req.getTenantTrx!();
  const result = await CartService.getByUserId(trx, userId);

  return res.status(StatusCodes.OK).json(result);
};
