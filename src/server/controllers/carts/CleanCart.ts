import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { RedisService } from "../../shared/services";
import { UnauthorizedError } from "../../errors";

export const cleanCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  const cartKey = `cart:${userId}`;

  await RedisService.invalidate(cartKey);

  return res.status(StatusCodes.NO_CONTENT).send();
};
