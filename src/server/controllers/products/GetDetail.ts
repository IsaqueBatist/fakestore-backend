import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from "yup";
import { Request, Response } from "express";
import { ProductProvider } from "../../database/providers/products";
import { BadRequestError } from "../../errors";

interface IParamProps {
  id?: number;
}

export const getDetailValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      id: yup.number().integer().required().moreThan(0),
    }),
  ),
}));

export const getDetail = async (req: Request<IParamProps>, res: Response) => {
  if (!req.params.id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }

  const result = await ProductProvider.getDetail(req.params.id);

  return res.status(StatusCodes.OK).json(result);
};
