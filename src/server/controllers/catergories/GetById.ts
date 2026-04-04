import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { CategoryProvider } from "../../database/providers/categories";
import { validation } from "../../shared/middlewares/Validation";
import { BadRequestError } from "../../errors";
import { RedisService } from "../../shared/services";

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
    throw new BadRequestError("The id parameter needs to be entered");
  }
  const categoryCacheKey = `category:${id}`;
  const cookedCategoryData = await RedisService.get(categoryCacheKey);

  if (cookedCategoryData)
    return res.status(StatusCodes.OK).json(cookedCategoryData);

  const result = await CategoryProvider.getById(id);
  await RedisService.set(categoryCacheKey, result, 3600);

  return res.status(StatusCodes.OK).json(result);
};
