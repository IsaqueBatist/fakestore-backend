import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { AddressProvider } from "../../database/providers/addresses";
import { validation } from "../../shared/middlewares/Validation";
import { BadRequestError, UnauthorizedError } from "../../errors";

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
    throw new BadRequestError("The id parameter needs to be enterred");
  }
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  await AddressProvider.deleteById(req.params.id, userId);

  return res.status(StatusCodes.NO_CONTENT).send();
};
