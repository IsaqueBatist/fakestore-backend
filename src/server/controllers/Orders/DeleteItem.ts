import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { OrderService } from "../../services/orders";
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
  const { id, order_id } = req.params;
  if (!id) {
    throw new BadRequestError("errors:param_required", { param: "id" });
  }
  if (!order_id) {
    throw new BadRequestError("errors:param_required", { param: "order_id" });
  }

  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  const trx = await req.getTenantTrx!();
  await OrderService.deleteItem(trx, userId, id, order_id);

  return res.status(StatusCodes.NO_CONTENT).send();
};
