import { Request, Response } from "express";
import { validation } from "../../shared/middlewares";
import * as yup from "yup";
import { StatusCodes } from "http-status-codes";
import { UserService } from "../../services/user";

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
  const trx = await req.getTenantTrx!();
  await UserService.forgotPassword(trx, req.body.email);

  return res.status(StatusCodes.OK).json({
    message:
      "Se o e-mail informado estiver cadastrado, um link de recuperação será enviado.",
  });
};
