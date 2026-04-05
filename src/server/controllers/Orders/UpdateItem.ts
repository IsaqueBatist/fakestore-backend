import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { IOrder_Item } from "../../database/models";
import { OrderProvider } from "../../database/providers/orders";
import { BadRequestError, UnauthorizedError } from "../../errors";

interface IBodyProps extends Omit<IOrder_Item, "id_order_item" | "order_id"> {}
interface IParamsProps {
  id?: number;
  order_id?: number;
}

export const updateItemValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      id: yup.number().required().moreThan(0),
      order_id: yup.number().required().moreThan(0),
    }),
  ),
  body: getSchema<IBodyProps>(
    yup.object().shape({
      product_id: yup.number().required().moreThan(0),
      quantity: yup.number().required(),
      unt_price: yup.number().required().moreThan(0),
    }),
  ),
}));

export const updateItem = async (
  req: Request<IParamsProps, {}, IBodyProps>,
  res: Response,
) => {
  const { id, order_id } = req.params;
  const userId = req.user?.id;
  if (!id) {
    throw new BadRequestError("The product ID must be provided in the URL.");
  }
  if (!order_id) {
    throw new BadRequestError("The order_id parameter needs to be entered");
  }
  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  await OrderProvider.updateItem(req.body, userId, order_id);

  return res.status(StatusCodes.NO_CONTENT).send();
};
