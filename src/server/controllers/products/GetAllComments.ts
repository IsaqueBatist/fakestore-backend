import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from "yup";
import { ProductService } from "../../services/products";
import { BadRequestError } from "../../errors";

interface IParamsProps {
  id?: number;
}

export const getAllCommentsValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      id: yup.number().optional(),
    }),
  ),
}));

export const getAllComments = async (
  req: Request<IParamsProps>,
  res: Response,
) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError("errors:param_required", { param: "id" });
  }

  const result = await ProductService.getAllComments(id);

  return res.status(StatusCodes.OK).json(result);
};
