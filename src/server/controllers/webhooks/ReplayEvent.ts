import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { WebhookEventService } from "../../services/webhooks";

interface IParamsProps {
  id: number;
}

export const replayEventValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      id: yup.number().integer().required(),
    }),
  ),
}));

export const replayEvent = async (req: Request, res: Response) => {
  const trx = await req.getTenantTrx!();

  const result = await WebhookEventService.replayEvent(
    trx,
    req.tenant!.id,
    Number(req.params.id),
  );

  return res.status(StatusCodes.OK).json(result);
};
