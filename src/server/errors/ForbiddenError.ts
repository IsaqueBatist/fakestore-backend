import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

export class ForbiddenError extends AppError {
  constructor(message: string, interpolation?: Record<string, string>) {
    super(message, StatusCodes.FORBIDDEN, interpolation);
  }
}
