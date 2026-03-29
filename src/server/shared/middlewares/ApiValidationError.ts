import { AppError } from "../../errors";

export class ApiValidationError extends AppError {
  public readonly errors: Record<string, Record<string, string>>;

  constructor(errors: Record<string, Record<string, string>>) {
    // Passamos uma mensagem genérica para o 'super'
    super("Validation failed", 400);
    this.errors = errors;
  }
}
