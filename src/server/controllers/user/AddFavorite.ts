import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { IUser_Favorite } from "../../database/models/User_favorite";
import { UserService } from "../../services/user";
import { UnauthorizedError } from "../../errors";

interface IBodyProps extends Omit<IUser_Favorite, "user_id"> {}

export const addFavoriteValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      product_id: yup.number().moreThan(0).required(),
    }),
  ),
}));

export const addFavorite = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  const result = await UserService.addFavorite(req.body.product_id, userId);

  return res.status(StatusCodes.CREATED).json(result);
};
