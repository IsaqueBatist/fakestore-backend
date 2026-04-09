import { errorMiddleware } from "../../../src/server/shared/middlewares/ErrorMiddleware";
import {
  AppError,
  UnauthorizedError,
  NotFoundError,
} from "../../../src/server/errors";
import { mockRequest, mockResponse, mockNext } from "../../helpers/mockRequest";

describe("ErrorMiddleware", () => {
  // Suppress console.error during tests
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it("should return translated error for AppError with correct statusCode", () => {
    const error = new UnauthorizedError("errors:unauthorized") as any;
    error.type = undefined;
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorMiddleware(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      errors: { default: "errors:unauthorized" }, // req.t returns the key
    });
  });

  it("should return 500 for unknown errors without statusCode", () => {
    const error = new Error("unexpected error") as any;
    error.type = undefined;
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorMiddleware(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      errors: { default: "common:internal_error" },
    });
  });

  it("should return 400 for entity.parse.failed (malformed JSON)", () => {
    const error = { type: "entity.parse.failed", message: "bad json" } as any;
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorMiddleware(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "common:invalid_json",
    });
  });

  it("should include error.errors when present (validation errors)", () => {
    const error = {
      statusCode: 400,
      message: "Validation failed",
      errors: { body: { email: "Email is required" } },
      type: undefined,
    } as any;
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorMiddleware(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: { body: { email: "Email is required" } },
    });
  });

  it("should handle NotFoundError correctly", () => {
    const error = new NotFoundError("errors:resource_not_found") as any;
    error.type = undefined;
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorMiddleware(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
