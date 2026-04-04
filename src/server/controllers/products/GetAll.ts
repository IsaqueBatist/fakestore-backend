import { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from "yup";
import { ProductProvider } from "../../database/providers/products";
import { RedisService } from "../../shared/services";
import Redis from "ioredis";

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

  const productCacheKey = `products:all:page:${page || 1}:limit:${limit || 7}`;

  const cachedProductData = await RedisService.get(productCacheKey);

  if (cachedProductData)
    return res.status(StatusCodes.OK).json(cachedProductData);

  const result = await ProductProvider.getAll(
    page || 1,
    Number(limit) || 7,
    filter || "",
    Number(id) || 0,
  );

  await RedisService.set(productCacheKey, result, 3600);

  const count = await ProductProvider.count(req.query.filter);

  res.setHeader("access-control-expose-headers", "x-total-count"); //Libera acesso ao navegador
  res.setHeader("x-total-count", count);

  return res.status(StatusCodes.OK).json(result);
};
