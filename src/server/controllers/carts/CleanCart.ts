import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UnauthorizedError } from "../../errors";
import { CartService } from "../../services/carts";

export const cleanCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  await CartService.cleanCart(userId);

  return res.status(StatusCodes.NO_CONTENT).send();
};
