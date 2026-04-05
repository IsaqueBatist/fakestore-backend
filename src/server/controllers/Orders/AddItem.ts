import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { IOrder_Item } from "../../database/models";
import { OrderService } from "../../services/orders";
import { BadRequestError, UnauthorizedError } from "../../errors";

interface IBodyProps extends Omit<IOrder_Item, "id_order_item" | "order_id" | "tenant_id"> {}
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

export const addItem = async (
  req: Request<IParamProps, {}, IBodyProps>,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }
  const { order_id } = req.params;
  if (!order_id) {
    throw new BadRequestError("errors:param_required", { param: "order_id" });
  }

  const trx = await req.getTenantTrx!();
  await OrderService.addItem(
    trx,
    req.body,
    userId,
    order_id,
  );

  return res.status(StatusCodes.CREATED).send();
};
