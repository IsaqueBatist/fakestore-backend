import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ProductProvider } from "../../database/providers/products";
import { validation } from "../../shared/middlewares";
import { BadRequestError } from "../../errors";
import { RedisService } from "../../shared/services";

interface IParamsProps {
  id?: number;
  category_id?: number;
}

export const deleteCategoryValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      id: yup.number().optional(),
      category_id: yup.number().optional(),
    }),
  ),
}));

export const deleteCategory = async (
  req: Request<IParamsProps>,
  res: Response,
) => {
  const { category_id, id } = req.params;

  if (!id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }
  if (!category_id) {
    throw new BadRequestError("The category_id parameter needs to be entered");
  }

  await ProductProvider.deleteCategory(category_id, id);
  await RedisService.invalidatePattern("product:list");
  await RedisService.invalidatePattern(`product:${id}`);

  return res.status(StatusCodes.NO_CONTENT).send();
};
