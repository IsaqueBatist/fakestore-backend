import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ProductProvider } from "../../database/providers/products";
import { validation } from "../../shared/middlewares";
import { BadRequestError } from "../../errors";

interface IParamsPropos {
  id?: number;
  category_id?: number;
}

export const deleteCategoryValidation = validation((getSchema) => ({
  params: getSchema<IParamsPropos>(
    yup.object().shape({
      id: yup.number().optional(),
      category_id: yup.number().optional(),
    }),
  ),
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteCategory = async (
  req: Request<IParamsPropos>,
  res: Response,
) => {
  if (!req.params.id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }
  if (!req.params.category_id) {
    throw new BadRequestError("The category_id parameter needs to be entered");
  }

  await ProductProvider.deleteCategory(req.params.category_id, req.params.id);

  return res.status(StatusCodes.NO_CONTENT).send();
};
