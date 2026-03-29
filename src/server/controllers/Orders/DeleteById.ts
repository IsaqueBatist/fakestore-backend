import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { OrderProvider } from "../../database/providers/orders";
import { validation } from "../../shared/middlewares/Validation";
import { BadRequestError } from "../../errors";

interface IParamProps {
  id?: number;
}

export const deleteByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      id: yup.number().integer().required().moreThan(0),
    }),
  ),
}));

export const deleteById = async (req: Request<IParamProps>, res: Response) => {
  if (!req.params.id) {
    throw new BadRequestError("User should be logged in");
  }

  await OrderProvider.deleteById(req.params.id);

  return res.status(StatusCodes.NO_CONTENT).send();
};
