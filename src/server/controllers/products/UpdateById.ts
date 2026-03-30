import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from "yup";
import { Request, Response } from "express";
import { IProduct } from "../../database/models";
import { ProductProvider } from "../../database/providers/products";
import { BadRequestError } from "../../errors";

interface IParamProps {
  id?: number;
}
interface IBodyProps extends Omit<IProduct, "id_product" | "created_at"> {}

export const updateByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      id: yup.number().integer().required().moreThan(0),
    }),
  ),
  body: getSchema<IBodyProps>(
    yup.object().shape({
      name: yup.string().required().min(3).max(150),
      description: yup.string().required(),
      price: yup.number().required().moreThan(0),
      image_url: yup.string().required(),
      rating: yup.number().required().moreThan(0),
      specifications: yup.object().required(),
    }),
  ),
}));

export const updateById = async (req: Request<IParamProps>, res: Response) => {
  if (!req.params.id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }

  await ProductProvider.updateById(req.params.id, req.body);

  return res.status(StatusCodes.NO_CONTENT).send();
};
