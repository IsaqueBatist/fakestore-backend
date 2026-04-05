import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

export class ConfigurationError extends AppError {
  constructor(
    message: string = "common:internal_error",
    interpolation?: Record<string, string>,
  ) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, interpolation);
  }
}
