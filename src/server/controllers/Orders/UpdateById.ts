import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { IOrder } from "../../database/models";
import { OrderService } from "../../services/orders";
import { ForbiddenError, UnauthorizedError } from "../../errors";

interface IBodyProps extends Omit<
  IOrder,
  "id_order" | "created_at" | "user_id" | "tenant_id"
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
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  const trx = await req.getTenantTrx!();
  const userOrders = await OrderService.getByUserId(trx, userId);

  const order = userOrders.find(
    (order) => Number(order.id_order) === Number(id),
  );

  if (!order) {
    throw new ForbiddenError("errors:forbidden_action", { action: "update", resource: "order" });
  }

  await OrderService.updateByUserId(trx, req.tenant!.id, order.id_order, req.body, req.pendingWebhooks);

  return res.status(StatusCodes.NO_CONTENT).send();
};
