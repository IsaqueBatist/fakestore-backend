import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CartProvider } from "../../database/providers/carts";
import { UnauthorizedError } from "../../errors";

export const getByUserId = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  const result = await CartProvider.getByUserId(userId);

  return res.status(StatusCodes.OK).json(result);
};
