import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { IUser } from "../../database/models";
import { UserProvider } from "../../database/providers/user";
import { validation } from "../../shared/middlewares/Validation";
import { passwordCrypto, JWTService } from "../../shared/services";
import { UnauthorizedError } from "../../errors";

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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const signIn = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response,
) => {
  const { email, password_hash } = req.body;

  const result = await UserProvider.getByEmail(email);

  const passowrdMatch = await passwordCrypto.verifyPassword(
    password_hash,
    result.password_hash,
  );

  if (!passowrdMatch) {
    throw new UnauthorizedError("Incorrect email or password");
  }

  const accessToken = JWTService.sign({
    uid: result.id_user,
    role: result.role,
  });

  return res.status(StatusCodes.OK).json({
    accessToken,
  });
};
