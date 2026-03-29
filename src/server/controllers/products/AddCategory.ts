import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ProductProvider } from "../../database/providers/products";
import { validation } from "../../shared/middlewares";
import { IProduct_Category } from "../../database/models/Product_category";
import { BadRequestError } from "../../errors";

interface IBodyProps extends Omit<IProduct_Category, "product_id"> {}
interface IParamsPropos {
  id?: number;
}

export const addCategoryValidation = validation((getSchema) => ({
  params: getSchema<IParamsPropos>(
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const addCategory = async (
  req: Request<IParamsPropos, {}, IBodyProps>,
  res: Response,
) => {
  if (!req.params.id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }

  const result = await ProductProvider.addCategory(
    req.params.id,
    req.body.category_id,
  );

  return res.status(StatusCodes.CREATED).json(result);
};
