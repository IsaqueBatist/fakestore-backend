export class AppError {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly interpolation?: Record<string, string>;

  constructor(
    message: string,
    statusCode = 400,
    interpolation?: Record<string, string>,
  ) {
    this.message = message;
    this.statusCode = statusCode;
    this.interpolation = interpolation;
  }
}
