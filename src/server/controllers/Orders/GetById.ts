import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OrderProvider } from "../../database/providers/orders";
import { validation } from "../../shared/middlewares";
import * as yup from "yup";
import { BadRequestError, UnauthorizedError } from "../../errors";

interface IParamProps {
  id?: number;
}

export const getByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      id: yup.number().optional().moreThan(0),
    }),
  ),
}));

export const getById = async (req: Request<IParamProps>, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }

  const result = await OrderProvider.getById(id, userId);

  return res.status(StatusCodes.OK).json(result);
};
