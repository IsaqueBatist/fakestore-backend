import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ForbiddenError } from "../../errors";

export const ensureAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "admin") {
    throw new ForbiddenError("Access denied: Admins only.");
  }

  return next();
};
