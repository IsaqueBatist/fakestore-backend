import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { IUser } from "../../database/models";
import { validation } from "../../shared/middlewares/Validation";
import { UserService } from "../../services/user";

interface IBodyProps extends Omit<
  IUser,
  | "id_user"
  | "name"
  | "created_at"
  | "role"
  | "password_reset_token"
  | "password_reset_expires"
> {}

export const signInValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      email: yup.string().required().email().min(5),
      password_hash: yup.string().required().min(6),
    }),
  ),
}));

export const signIn = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response,
) => {
  const { email, password_hash } = req.body;

  const result = await UserService.signIn(email, password_hash);

  return res.status(StatusCodes.OK).json(result);
};
