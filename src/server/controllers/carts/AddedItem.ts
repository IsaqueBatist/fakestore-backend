import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { UnauthorizedError, BadRequestError } from "../../errors";

import { ProductProvider } from "../../database/providers/products";
import { RedisService } from "../../shared/services";

interface IBodyProps {
  product_id: number;
  quantity: number;
}

export const addedItemValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      product_id: yup.number().integer().required().moreThan(0),
      quantity: yup.number().integer().required().moreThan(0),
    }),
  ),
}));

export const additem = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  const { product_id, quantity } = req.body;

  const productInfo = await ProductProvider.getById(product_id);

  if (!productInfo) {
    throw new BadRequestError("The specified product does not exist.");
  }

  const unt_price = productInfo.price;

  const cartKey = `cart:${userId}`;
  const hashField = String(product_id);

  const hashValue = JSON.stringify({ quantity, price: unt_price });
  await RedisService.hset(cartKey, hashField, hashValue);
  await RedisService.expire(cartKey, 604800);

  const result = {
    product_id,
    quantity,
    price: unt_price,
  };

  return res.status(StatusCodes.CREATED).json(result);
};
