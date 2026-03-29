import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { UserProvider } from "../../database/providers/user";
import { BadRequestError, UnauthorizedError } from "../../errors";

interface IParamsPropos {
  id?: number;
}

export const deleteFavoriteValidation = validation((getSchema) => ({
  params: getSchema<IParamsPropos>(
    yup.object().shape({
      id: yup.number().optional(),
    }),
  ),
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteFavorite = async (
  req: Request<IParamsPropos>,
  res: Response,
) => {
  if (!req.params.id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  await UserProvider.deleteFavorite(userId, req.params.id);

  return res.status(StatusCodes.NO_CONTENT).send();
};
