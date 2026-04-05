import { RequestHandler } from "express";
import { JWTService } from "../services";
import { UnauthorizedError } from "../../errors";

export const ensureAuthenticated: RequestHandler = async (req, _res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new UnauthorizedError("errors:unauthorized");
  }

  const [type, token] = authorization.split(" ");

  if (type != "Bearer") {
    throw new UnauthorizedError("errors:unauthorized");
  }

  const jwtData = JWTService.verify(token);

  // Cross-tenant validation: JWT tenant must match the API key's tenant
  if (req.tenant && jwtData.tid !== req.tenant.id) {
    throw new UnauthorizedError("errors:token_tenant_mismatch");
  }

  req.user = { id: Number(jwtData.uid), role: jwtData.role };
  return next();
};
