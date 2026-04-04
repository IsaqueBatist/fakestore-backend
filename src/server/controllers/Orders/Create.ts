import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OrderProvider } from "../../database/providers/orders";
import { UnauthorizedError } from "../../errors";
import { RedisService } from "../../shared/services";

export const create = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }
  const cartCacheKey = `cart:${userId}`;

  await RedisService.set(cartCacheKey, "", 604800);

  return res.status(StatusCodes.CREATED).send();
};
