import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { JWTService } from "../services";
import { UnauthorizedError } from "../../errors";

export const ensureAuthenticated: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new UnauthorizedError("errors:unauthorized");
  }

  const [type, token] = authorization.split(" ");

  if (type != "Bearer") {
    throw new UnauthorizedError("errors:unauthorized");
  }

  const jwtData = JWTService.verify(token);

  req.user = { id: Number(jwtData.uid), role: jwtData.role };
  return next();
};
