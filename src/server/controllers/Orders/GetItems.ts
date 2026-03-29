import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OrderProvider } from "../../database/providers/orders";
import { validation } from "../../shared/middlewares";
import * as yup from "yup";
import { BadRequestError, UnauthorizedError } from "../../errors";
interface IParamProps {
  order_id?: number;
}

export const getByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      order_id: yup.number().optional().moreThan(0),
    }),
  ),
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getItem = async (req: Request<IParamProps>, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }
  if (!req.params.order_id) {
    throw new BadRequestError("The order_id parameter needs to be entered");
  }

  const result = await OrderProvider.getItems(userId, req.params.order_id);

  return res.status(StatusCodes.OK).json(result);
};
