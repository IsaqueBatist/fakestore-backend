import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

export class UnauthorizedError extends AppError {
  constructor(message: string, interpolation?: Record<string, string>) {
    super(message, StatusCodes.UNAUTHORIZED, interpolation);
  }
}
