import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { CategoryProvider } from "../../database/providers/categories";
import { validation } from "../../shared/middlewares/Validation";
import { CACHE_TTL, PAGINATION_DEFAULTS } from "../../shared/constants";
import { RedisService } from "../../shared/services";
import { IProduct_Category } from "../../database/models";
import { CategoryController } from ".";

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
// ... (outras importações)

export const getAll = async (
  req: Request<{}, {}, {}, IQueryProps>,
  res: Response,
) => {
  const queryPage = req.query.page || PAGINATION_DEFAULTS.PAGE;
  const queryLimit = req.query.limit || PAGINATION_DEFAULTS.LIMIT;
  const queryFilter = req.query.filter || "";
  const queryId = Number(req.query.id) || 0;

  const queryParams = new URLSearchParams({
    p: String(queryPage),
    l: String(queryLimit),
    f: queryFilter,
    id: String(queryId),
  }).toString();

  const categoryCacheKey = `category:list:${queryParams}`;

  const cachedCategoryData =
    await RedisService.get<IProduct_Category[]>(categoryCacheKey);

  if (cachedCategoryData) {
    res.setHeader("access-control-expose-headers", "x-total-count");
    res.setHeader("x-total-count", cachedCategoryData.length);
    return res.status(StatusCodes.OK).json(cachedCategoryData);
  }

  const result = await CategoryProvider.getAll(
    queryPage,
    queryLimit,
    queryFilter,
    queryId,
  );
  const count = await CategoryProvider.count(queryFilter);

  await RedisService.set(categoryCacheKey, result, CACHE_TTL.ONE_HOUR);

  res.setHeader("access-control-expose-headers", "x-total-count");
  res.setHeader("x-total-count", count);

  return res.status(StatusCodes.OK).json(result);
};
