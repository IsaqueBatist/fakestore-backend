import { NextFunction, Request, Response } from "express";
import { AppError } from "../../errors";

export const errorMiddleware = (
  error: Error & Partial<AppError> & { errors?: any; type: string }, // Adicionamos suporte a 'errors'
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON format" });
  }
  const statusCode = error.statusCode ?? 500;

  const message = error.statusCode ? error.message : "Internal Server Error";

  console.error(error);

  return res.status(statusCode).json({
    message,
    ...(error.errors ? { errors: error.errors } : {}),
  });
};
