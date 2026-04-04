import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { IUser } from "../../database/models";
import { CartProvider } from "../../database/providers/carts";
import { UserProvider } from "../../database/providers/user";
import { validation } from "../../shared/middlewares/Validation";

interface IBodyProps extends Omit<
  IUser,
  | "id_user"
  | "name"
  | "created_at"
  | "role"
  | "password_reset_token"
  | "password_reset_expires"
> {}

export const signUpValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      name: yup.string().required().min(3),
      email: yup.string().required().email().min(5),
      password_hash: yup.string().required().min(6),
    }),
  ),
}));

export const signUp = async (req: Request<{}, {}, IUser>, res: Response) => {
  const result = await UserProvider.create(req.body);

  await CartProvider.createCart(result);

  return res.status(StatusCodes.CREATED).json(result);
};
