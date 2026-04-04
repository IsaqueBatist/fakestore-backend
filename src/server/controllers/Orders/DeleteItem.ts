import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { OrderProvider } from "../../database/providers/orders";
import { BadRequestError, UnauthorizedError } from "../../errors";

interface IParamProps {
  order_id?: number;
  id?: number;
}

export const deleteItemValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      order_id: yup.number().optional().moreThan(0),
      id: yup.number().optional().moreThan(0),
    }),
  ),
}));

export const deleteItem = async (req: Request<IParamProps>, res: Response) => {
  if (!req.params.id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }
  if (!req.params.order_id) {
    throw new BadRequestError("The order_id parameter needs to be entered");
  }

  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  await OrderProvider.deleteItem(userId, req.params.id, req.params.order_id);

  return res.status(StatusCodes.NO_CONTENT).send();
};
