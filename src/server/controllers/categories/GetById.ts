import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { CategoryService } from "../../services/categories";
import { validation } from "../../shared/middlewares/Validation";
import { BadRequestError } from "../../errors";
import { RedisService } from "../../shared/services";
import { CACHE_TTL } from "../../shared/constants";

interface IParamProps {
  id?: number;
}

export const getByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      id: yup.number().integer().required().moreThan(0),
    }),
  ),
}));

export const getById = async (req: Request<IParamProps>, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError("errors:param_required", { param: "id" });
  }
  const categoryCacheKey = `category:${id}`;
  const cachedCategoryData = await RedisService.get(categoryCacheKey);

  if (cachedCategoryData)
    return res.status(StatusCodes.OK).json(cachedCategoryData);

  const result = await CategoryService.getById(id);
  await RedisService.set(categoryCacheKey, result, CACHE_TTL.ONE_HOUR);

  return res.status(StatusCodes.OK).json(result);
};
