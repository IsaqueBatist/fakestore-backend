import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { LogProvider } from "../../database/providers/logs";

interface IQueryProps {
  method?: string;
  path?: string;
  status?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export const listLogsValidation = validation((getSchema) => ({
  query: getSchema<IQueryProps>(
    yup.object().shape({
      method: yup
        .string()
        .oneOf(["GET", "POST", "PUT", "DELETE", "PATCH"])
        .optional(),
      path: yup.string().optional(),
      status: yup.number().integer().optional(),
      date_from: yup.string().optional(),
      date_to: yup.string().optional(),
      page: yup.number().integer().min(1).default(1).optional(),
      limit: yup.number().integer().min(1).max(100).default(50).optional(),
    }),
  ),
}));

export const listLogs = async (req: Request, res: Response) => {
  const trx = await req.getTenantTrx!();

  const result = await LogProvider.getLogs(trx, {
    method: req.query.method as string | undefined,
    path: req.query.path as string | undefined,
    status_code: req.query.status ? Number(req.query.status) : undefined,
    date_from: req.query.date_from as string | undefined,
    date_to: req.query.date_to as string | undefined,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
  });

  return res.status(StatusCodes.OK).json({
    ...result,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
  });
};
