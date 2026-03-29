import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { ICart_Item } from "../../database/models/Cart_Item";
import { CartProvider } from "../../database/providers/carts";
import { BadRequestError, UnauthorizedError } from "../../errors";

interface IBodyProps extends Omit<
  ICart_Item,
  "id_cart_item" | "added_at" | "cart_id" | "product_id"
> {}
interface IParamsProps {
  product_id?: number;
}

export const updateByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      product_id: yup.number().required().moreThan(0),
    }),
  ),
  body: getSchema<IBodyProps>(
    yup.object().shape({
      quantity: yup.number().required().moreThan(0),
    }),
  ),
}));

export const updateById = async (
  req: Request<IParamsProps, {}, IBodyProps>,
  res: Response,
) => {
  if (!req.params.product_id) {
    throw new BadRequestError("The product ID must be provided in the URL.");
  }

  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  await CartProvider.updateItem(req.body, userId, req.params.product_id);

  return res.status(StatusCodes.NO_CONTENT).send();
};
