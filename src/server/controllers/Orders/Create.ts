import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OrderProvider } from "../../database/providers/orders";
import { UnauthorizedError } from "../../errors";

export const create = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  const result = await OrderProvider.create(userId);

  return res.status(StatusCodes.CREATED).json(result);
};
