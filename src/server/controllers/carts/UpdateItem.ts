import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { BadRequestError, UnauthorizedError } from "../../errors";
import { CartService } from "../../services/carts";

interface IParamsProps {
  product_id?: number;
}

interface IBodyProps {
  quantity: number;
}

export const updateByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      product_id: yup.number().integer().required().moreThan(0),
    }),
  ),
  body: getSchema<IBodyProps>(
    yup.object().shape({
      quantity: yup.number().integer().required().moreThan(0),
    }),
  ),
}));

export const updateById = async (
  req: Request<IParamsProps, unknown, IBodyProps>,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  const { product_id } = req.params;

  if (!product_id) {
    throw new BadRequestError("errors:param_required", { param: "product_id" });
  }

  await CartService.updateItem(req.body, userId, product_id);

  return res.status(StatusCodes.NO_CONTENT).send();
};
