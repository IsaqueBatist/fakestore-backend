import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserService } from "../../services/user";
import { UnauthorizedError } from "../../errors";

export const getFavorites = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  const trx = await req.getTenantTrx!();
  const result = await UserService.getFavorites(trx, userId);

  return res.status(StatusCodes.OK).json(result);
};
