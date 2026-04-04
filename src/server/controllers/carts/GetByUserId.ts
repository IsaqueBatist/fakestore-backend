import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UnauthorizedError } from "../../errors";
import { RedisService } from "../../shared/services";

export const getByUserId = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  const cartKey = `cart:${userId}`;

  const rawCart = await RedisService.hgetall(cartKey);

  const formattedCart = Object.entries(rawCart).map(([productId, itemData]) => {
    const parsedData = JSON.parse(itemData);

    return {
      product_id: Number(productId),
      quantity: parsedData.quantity,
      price: parsedData.price,
    };
  });

  return res.status(StatusCodes.OK).json(formattedCart);
};
