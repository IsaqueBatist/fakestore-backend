import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

export class DatabaseError extends AppError {
  constructor(
    message: string = "errors:db_error_getting",
    interpolation?: Record<string, string>,
  ) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, interpolation);
  }
}
