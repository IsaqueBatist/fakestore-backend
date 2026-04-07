import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { JWTService, passwordCrypto } from "../../shared/services";
import { TenantService } from "../../services/tenants";
import { UnauthorizedError } from "../../errors";
import { Knex } from "../../database/knex";
import { EtableNames } from "../../database/ETableNames";

interface IBodyProps {
  password: string;
}

export const rotateCredentialsValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      password: yup.string().required(),
    }),
  ),
}));

export const rotateCredentials = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response,
) => {
  // Extract tenant_id from JWT payload
  const [, token] = (req.headers.authorization || "").split(" ");
  const jwtData = JWTService.verify(token);
  const tenantId = jwtData.tid;

  // Sudo Mode: verify admin's current password
  const user = await Knex(EtableNames.user)
    .where("id_user", req.user!.id)
    .select("password_hash")
    .first();

  const passwordMatch = await passwordCrypto.verifyPassword(
    req.body.password,
    user!.password_hash,
  );

  if (!passwordMatch) {
    throw new UnauthorizedError("errors:incorrect_credentials");
  }

  const result = await TenantService.rotateKeys({ tenantId });

  return res.status(StatusCodes.OK).json(result);
};
