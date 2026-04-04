import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { BadRequestError, UnauthorizedError } from "../../errors";
import { RedisService } from "../../shared/services";

interface IParamsProps {
  product_id: number;
}

interface IBodyProps {
  quantity: number;
}

export const updateByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      product_id: yup.number().integer().required().moreThan(0),
    }),
  ),
  body: getSchema<IBodyProps>(
    yup.object().shape({
      quantity: yup.number().integer().required().moreThan(0),
    }),
  ),
}));

export const updateById = async (
  req: Request<IParamsProps, unknown, IBodyProps>,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  const { product_id } = req.params;
  const { quantity } = req.body;

  const cartKey = `cart:${userId}`;
  const hashField = String(product_id);

  const rawItem = await RedisService.hget(cartKey, hashField);

  if (!rawItem) {
    throw new BadRequestError("The specified item does not exist in the cart.");
  }

  const parsedItem = JSON.parse(rawItem);

  parsedItem.quantity = quantity;

  await RedisService.hset(cartKey, hashField, JSON.stringify(parsedItem));
  await RedisService.expire(cartKey, 604800);

  return res.status(StatusCodes.NO_CONTENT).send();
};
