import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

export class TransactionError extends AppError {
  constructor(message: string = "Transaction error") {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
