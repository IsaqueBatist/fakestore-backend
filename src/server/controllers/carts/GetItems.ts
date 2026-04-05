import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UnauthorizedError } from "../../errors";
import { CartProvider } from "../../database/providers/carts";

export const getItem = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  const result = await CartProvider.getItems(userId);

  return res.status(StatusCodes.OK).json(result);
};
