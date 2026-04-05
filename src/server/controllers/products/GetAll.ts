import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from "yup";
import { ProductService } from "../../services/products";
import { CACHE_TTL, PAGINATION_DEFAULTS } from "../../shared/constants";
import { RedisService } from "../../shared/services";

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
  const { filter, id, limit, page } = req.query;

  const productCacheKey = `products:all:page:${page || PAGINATION_DEFAULTS.PAGE}:limit:${limit || PAGINATION_DEFAULTS.LIMIT}`;

  const cachedProductData = await RedisService.get(productCacheKey);

  if (cachedProductData)
    return res.status(StatusCodes.OK).json(cachedProductData);

  const trx = await req.getTenantTrx!();
  const result = await ProductService.getAll(
    trx,
    page || PAGINATION_DEFAULTS.PAGE,
    Number(limit) || PAGINATION_DEFAULTS.LIMIT,
    filter || "",
    Number(id) || 0,
  );

  await RedisService.set(productCacheKey, result, CACHE_TTL.ONE_HOUR);

  const count = await ProductService.count(trx, req.query.filter);

  res.setHeader("access-control-expose-headers", "x-total-count"); //Libera acesso ao navegador
  res.setHeader("x-total-count", count);

  return res.status(StatusCodes.OK).json(result);
};
