import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from "yup";
import { ProductService } from "../../services/products";
import { CACHE_TTL, PAGINATION_DEFAULTS } from "../../shared/constants";
import { RedisService } from "../../shared/services";
import { decodeCursor, buildCursorResponse } from "../../shared/utils/cursor";

interface IQueryProps {
  cursor?: string;
  limit?: number;
  filter?: string;
}

export const getAllValidation = validation((getSchema) => ({
  query: getSchema<IQueryProps>(
    yup.object().shape({
      cursor: yup.string().optional(),
      limit: yup.number().optional().moreThan(0),
      filter: yup.string().optional(),
    }),
  ),
}));

export const getAll = async (
  req: Request<{}, {}, {}, IQueryProps>,
  res: Response,
) => {
  const { filter, limit, cursor } = req.query;
  const effectiveLimit = Number(limit) || PAGINATION_DEFAULTS.LIMIT;
  const afterCursor = cursor ? decodeCursor(cursor) : 0;

  const cacheKey = `t:${req.tenant!.id}:products:all:cursor:${afterCursor}:limit:${effectiveLimit}:filter:${filter || ""}`;

  const cached = await RedisService.get(cacheKey);
  if (cached) return res.status(StatusCodes.OK).json(cached);

  const trx = await req.getTenantTrx!();
  const result = await ProductService.getAll(
    trx,
    effectiveLimit,
    filter || "",
    afterCursor,
  );

  const response = buildCursorResponse(result, effectiveLimit, "id_product");

  await RedisService.set(cacheKey, response, CACHE_TTL.ONE_HOUR);

  return res.status(StatusCodes.OK).json(response);
};
