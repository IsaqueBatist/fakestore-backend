import { Request, Response } from "express";
import { validation } from "../../shared/middlewares";
import * as yup from "yup";
import { UserProvider } from "../../database/providers/user";
import { v4 as uuidv4 } from "uuid";
import { sendForgotPasswordEmail } from "../../shared/services";
import { AppError } from "../../errors";
import { StatusCodes } from "http-status-codes";

interface IBodyProps {
  email: string;
}

export const forgotPasswordValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      email: yup.string().email().required(),
    }),
  ),
}));

export const forgotPassword = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response,
) => {
  const { email } = req.body;

  let user = null;
  try {
    user = await UserProvider.getByEmail(email);
  } catch {
    // Silently ignore - don't reveal if email exists (security)
  }

  if (user) {
    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await UserProvider.updateToken(user.id_user, token, expires);
    await sendForgotPasswordEmail(email, token);

  }

  return res.status(StatusCodes.OK).json({
    message:
      "Se o e-mail informado estiver cadastrado, um link de recuperação será enviado.",
  });
};
