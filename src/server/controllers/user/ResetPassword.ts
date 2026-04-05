import { Response, Request } from "express";
import { validation } from "../../shared/middlewares";
import * as yup from "yup";
import { StatusCodes } from "http-status-codes";
import { UserService } from "../../services/user";

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

  await UserService.resetPassword(token, newPassword);

  return res.status(StatusCodes.NO_CONTENT).send();
};
