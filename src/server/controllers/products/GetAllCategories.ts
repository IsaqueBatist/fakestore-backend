import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from "yup";
import { ProductService } from "../../services/products";
import { BadRequestError } from "../../errors";
import { RedisService } from "../../shared/services";
import { CACHE_TTL } from "../../shared/constants";

interface IParamsProps {
  id?: number;
}

export const getAllCategoriesValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      id: yup.number().optional(),
    }),
  ),
}));

export const getAllCategories = async (
  req: Request<IParamsProps>,
  res: Response,
) => {
  const { id } = req.params;
  if (!id) throw new BadRequestError("errors:param_required", { param: "id" });

  const productCategoryKey = `product:${id}:categories`;

  const cachedCategoryData = await RedisService.get(productCategoryKey);

  if (cachedCategoryData)
    return res.status(StatusCodes.OK).json(cachedCategoryData);

  const result = await ProductService.getAllCategories(id);

  await RedisService.set(productCategoryKey, result, CACHE_TTL.ONE_HOUR);

  return res.status(StatusCodes.OK).json(result);
};
