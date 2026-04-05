import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

export class TransactionError extends AppError {
  constructor(
    message: string = "errors:unable_to_add_item",
    interpolation?: Record<string, string>,
  ) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, interpolation);
  }
}
