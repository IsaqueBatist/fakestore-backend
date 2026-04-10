import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { WebhookEventService } from "../../services/webhooks";

interface IQueryProps {
  status?: string;
  event_type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export const listEventsValidation = validation((getSchema) => ({
  query: getSchema<IQueryProps>(
    yup.object().shape({
      status: yup.string().oneOf(["pending", "delivered", "failed"]).optional(),
      event_type: yup.string().optional(),
      date_from: yup.string().optional(),
      date_to: yup.string().optional(),
      page: yup.number().integer().min(1).default(1).optional(),
      limit: yup.number().integer().min(1).max(100).default(20).optional(),
    }),
  ),
}));

export const listEvents = async (req: Request, res: Response) => {
  const trx = await req.getTenantTrx!();

  const result = await WebhookEventService.listEvents({
    trx,
    status: req.query.status as string | undefined,
    event_type: req.query.event_type as string | undefined,
    date_from: req.query.date_from as string | undefined,
    date_to: req.query.date_to as string | undefined,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });

  return res.status(StatusCodes.OK).json(result);
};
