import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

export class ConfigurationError extends AppError {
  constructor(message: string = "Configuration error") {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
