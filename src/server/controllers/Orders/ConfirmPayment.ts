import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { OrderService } from "../../services/orders";

interface IParamsProps {
  orderId?: number;
}

export const confirmPaymentValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      orderId: yup.number().required().moreThan(0),
    }),
  ),
}));

export const confirmPayment = async (
  req: Request<IParamsProps>,
  res: Response,
) => {
  const { orderId } = req.params;

  const trx = await req.getTenantTrx!();
  const result = await OrderService.confirmPayment(
    trx,
    req.tenant!.id,
    Number(orderId),
    req.pendingWebhooks,
  );

  return res.status(StatusCodes.OK).json(result);
};
