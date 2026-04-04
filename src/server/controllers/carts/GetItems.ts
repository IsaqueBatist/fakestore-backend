import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { UnauthorizedError } from "../../errors";
import { RedisService } from "../../shared/services";

interface IParamProps {
  productId: number;
}

export const getItemValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      productId: yup.number().integer().required().moreThan(0),
    }),
  ),
}));

export const getItem = async (req: Request<IParamProps>, res: Response) => {
  const userId = req.user?.id;
  const { productId } = req.params;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  const cartKey = `cart:${userId}`;
  const hashField = String(productId);

  const rawItem = await RedisService.hget(cartKey, hashField);

  if (!rawItem) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }

  const parsedItem = JSON.parse(rawItem);

  const result = {
    product_id: Number(productId),
    quantity: parsedItem.quantity,
    price: parsedItem.price,
  };

  return res.status(StatusCodes.OK).json(result);
};
