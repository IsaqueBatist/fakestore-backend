import { Response, Request } from "express";
import { validation } from "../../shared/middlewares";
import * as yup from "yup";
import { UserProvider } from "../../database/providers/user";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
interface IBodyProps {
  token: string;
  newPassword: string;
}

export const resetPasswordValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      token: yup.string().uuid().required(),
      newPassword: yup.string().min(8).required(),
    }),
  ),
}));

export const resetPassword = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response,
) => {
  const { newPassword, token } = req.body;

  const user = await UserProvider.getByToken(token);

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await UserProvider.updatePassword(user.id_user, hashedPassword);

  return res.status(StatusCodes.NO_CONTENT).json();
};
