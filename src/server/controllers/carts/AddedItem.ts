import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { UnauthorizedError } from "../../errors";
import { CartService } from "../../services/carts";

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

export const addItem = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  const result = await CartService.addItem(req.body, userId);

  return res.status(StatusCodes.CREATED).json(result);
};
