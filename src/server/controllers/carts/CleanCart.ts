import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UnauthorizedError } from "../../errors";
import { CartProvider } from "../../database/providers/carts";

export const cleanCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  await CartProvider.cleanCart(userId);

  return res.status(StatusCodes.NO_CONTENT).send();
};
