import { NextFunction, Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { AppError } from "../../errors";
import { logger } from "../services/Logger";

export const errorMiddleware = (
  error: Error & Partial<AppError> & { errors?: any; type: string },
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: req.t("common:invalid_json") });
  }

  const statusCode = error.statusCode ?? 500;
  const messageKey = error.statusCode ? error.message : "common:internal_error";
  const translated = req.t(messageKey, error.interpolation ?? {});

  logger.error({ err: error, statusCode, path: req.path, method: req.method }, "Request error");

  // Only report unexpected errors (5xx) to Sentry
  if (statusCode >= 500) {
    Sentry.captureException(error);
  }

  return res.status(statusCode).json({
    ...(error.errors
      ? { errors: error.errors }
      : { errors: { default: translated } }),
  });
};
