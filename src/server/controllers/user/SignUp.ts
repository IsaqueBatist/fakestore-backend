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
  | "tenant_id"
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
  const trx = await req.getTenantTrx!();
  const result = await UserService.signUp(trx, req.body);

  return res.status(StatusCodes.CREATED).json(result);
};
