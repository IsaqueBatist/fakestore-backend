import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { UserService } from "../../services/user";
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
    throw new BadRequestError("errors:param_required", { param: "id" });
  }
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  await UserService.deleteFavorite(userId, id);

  return res.status(StatusCodes.NO_CONTENT).send();
};
