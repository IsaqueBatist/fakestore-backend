import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { CategoryService } from "../../services/categories";
import { validation } from "../../shared/middlewares/Validation";
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
  const effectiveLimit = Number(req.query.limit) || PAGINATION_DEFAULTS.LIMIT;
  const filter = req.query.filter || "";
  const afterCursor = req.query.cursor ? decodeCursor(req.query.cursor) : 0;

  const cacheKey = `t:${req.tenant!.id}:categories:all:cursor:${afterCursor}:limit:${effectiveLimit}:filter:${filter}`;

  const cached = await RedisService.get(cacheKey);
  if (cached) return res.status(StatusCodes.OK).json(cached);

  const trx = await req.getTenantTrx!();
  const result = await CategoryService.getAll(trx, effectiveLimit, filter, afterCursor);

  const response = buildCursorResponse(result, effectiveLimit, "id_category");

  await RedisService.set(cacheKey, response, CACHE_TTL.ONE_HOUR);

  return res.status(StatusCodes.OK).json(response);
};
