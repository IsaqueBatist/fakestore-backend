import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { AddressService } from "../../services/addresses";
import { validation } from "../../shared/middlewares/Validation";
import { PAGINATION_DEFAULTS } from "../../shared/constants";

interface IQueryProps {
  id?: number;
  page?: number;
  limit?: number;
  filter?: string;
}

export const getAllValidation = validation((getSchema) => ({
  query: getSchema<IQueryProps>(
    yup.object().shape({
      id: yup.number().optional().moreThan(0),
      page: yup.number().optional().moreThan(0),
      limit: yup.number().optional().moreThan(0),
      filter: yup.string().optional(),
    }),
  ),
}));

export const getAll = async (
  req: Request<{}, {}, {}, IQueryProps>,
  res: Response,
) => {
  const trx = await req.getTenantTrx!();
  const result = await AddressService.getAll(
    trx,
    req.query.page || PAGINATION_DEFAULTS.PAGE,
    req.query.limit || PAGINATION_DEFAULTS.LIMIT,
    req.query.filter || "",
    Number(req.query.id) || 0,
  );
  const count = await AddressService.count(trx, req.query.filter);

  res.setHeader("access-control-expose-headers", "x-total-count"); //Libera acesso ao navegador
  res.setHeader("x-total-count", count);

  return res.status(StatusCodes.OK).json(result);
};
