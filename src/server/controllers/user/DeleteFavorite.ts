import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { UserProvider } from "../../database/providers/user";
import { BadRequestError, UnauthorizedError } from "../../errors";

interface IParamsProps {
  id?: number;
}

export const deleteFavoriteValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      id: yup.number().optional(),
    }),
  ),
}));

export const deleteFavorite = async (
  req: Request<IParamsProps>,
  res: Response,
) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  await UserProvider.deleteFavorite(userId, id);

  return res.status(StatusCodes.NO_CONTENT).send();
};
