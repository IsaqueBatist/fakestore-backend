import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ProductProvider } from "../../database/providers/products";
import { validation } from "../../shared/middlewares";
import { IProduct_Category } from "../../database/models/Product_category";
import { BadRequestError } from "../../errors";
import { RedisService } from "../../shared/services";

interface IBodyProps extends Omit<IProduct_Category, "product_id"> {}
interface IParamsProps {
  id?: number;
}

export const addCategoryValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      id: yup.number().required(),
    }),
  ),
  body: getSchema<IBodyProps>(
    yup.object().shape({
      category_id: yup.number().moreThan(0).required(),
    }),
  ),
}));

export const addCategory = async (
  req: Request<IParamsProps, {}, IBodyProps>,
  res: Response,
) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }

  const result = await ProductProvider.addCategory(id, req.body.category_id);

  await RedisService.invalidatePattern(`product:${id}`);
  await RedisService.invalidatePattern(`product:list`);

  return res.status(StatusCodes.CREATED).json(result);
};
