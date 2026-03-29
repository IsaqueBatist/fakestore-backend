import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { IOrder } from "../../database/models";
import { OrderProvider } from "../../database/providers/orders";
import { ForbiddenError, UnauthorizedError } from "../../errors";

interface IBodyProps extends Omit<
  IOrder,
  "id_order" | "created_at" | "user_id"
> {}
interface IParamsProps {
  id?: number;
}

export const updateByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      id: yup.number().optional().moreThan(0),
    }),
  ),
  body: getSchema<IBodyProps>(
    yup.object().shape({
      total: yup.number().required().moreThan(0),
      status: yup.string().required(),
    }),
  ),
}));

export const updateById = async (req: Request<IParamsProps>, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  const userOrders = await OrderProvider.getByUserId(userId);

  const order = userOrders.find(
    (order) => Number(order.id_order) === Number(req.params.id),
  );

  if (!order) {
    throw new ForbiddenError("You are not allowed to update this order");
  }

  await OrderProvider.updateByUserId(order.id_order, req.body);

  return res.status(StatusCodes.NO_CONTENT).send();
};
