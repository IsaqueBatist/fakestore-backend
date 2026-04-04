import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { IOrder_Item } from "../../database/models";
import { OrderProvider } from "../../database/providers/orders";
import { BadRequestError, UnauthorizedError } from "../../errors";

interface IBodyProps extends Omit<IOrder_Item, "id_order_item" | "order_id"> {}
interface IParamProps {
  order_id?: number;
}

export const addedItemValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      product_id: yup.number().required().moreThan(0),
      quantity: yup.number().required(),
      unt_price: yup.number().required().moreThan(0),
    }),
  ),
  params: getSchema<IParamProps>(
    yup.object().shape({
      order_id: yup.number().optional().moreThan(0),
    }),
  ),
}));

export const additem = async (
  req: Request<IParamProps, {}, IBodyProps>,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }
  if (!req.params.order_id) {
    throw new BadRequestError("The order_id parameter needs to be entered");
  }

  const result = await OrderProvider.addItem(
    req.body,
    userId,
    req.params.order_id,
  );

  return res.status(StatusCodes.CREATED).json(result);
};
