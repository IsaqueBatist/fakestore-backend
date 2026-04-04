import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CartProvider } from "../../database/providers/carts";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { BadRequestError, UnauthorizedError } from "../../errors";
import { RedisService } from "../../shared/services";

interface IParamProps {
  id?: number;
}

export const deleteItemValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      id: yup.number().integer().required().moreThan(0),
    }),
  ),
}));

export const deleteItem = async (req: Request<IParamProps>, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }

  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  const cartKey = `cart:${userId}`;
  await RedisService.hdel(cartKey, String(id));

  return res.status(StatusCodes.NO_CONTENT).send();
};
