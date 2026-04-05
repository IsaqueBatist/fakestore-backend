import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  TransactionError,
  ConfigurationError,
} from "../../../src/server/errors";

describe("Error Classes", () => {
  describe("AppError", () => {
    it("should set message and default statusCode 400", () => {
      const error = new AppError("test error");
      expect(error.message).toBe("test error");
      expect(error.statusCode).toBe(400);
    });

    it("should accept custom statusCode", () => {
      const error = new AppError("server error", 500);
      expect(error.statusCode).toBe(500);
    });

    it("should accept interpolation parameters", () => {
      const error = new AppError("error", 400, { resource: "User" });
      expect(error.interpolation).toEqual({ resource: "User" });
    });
  });

  describe("BadRequestError", () => {
    it("should have statusCode 400", () => {
      const error = new BadRequestError("bad request");
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("bad request");
    });
  });

  describe("UnauthorizedError", () => {
    it("should have statusCode 401", () => {
      const error = new UnauthorizedError("unauthorized");
      expect(error.statusCode).toBe(401);
    });
  });

  describe("ForbiddenError", () => {
    it("should have statusCode 403", () => {
      const error = new ForbiddenError("forbidden");
      expect(error.statusCode).toBe(403);
    });
  });

  describe("NotFoundError", () => {
    it("should have statusCode 404", () => {
      const error = new NotFoundError("not found");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("ConflictError", () => {
    it("should have statusCode 409", () => {
      const error = new ConflictError("conflict");
      expect(error.statusCode).toBe(409);
    });
  });

  describe("DatabaseError", () => {
    it("should have statusCode 500", () => {
      const error = new DatabaseError();
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("errors:db_error_getting");
    });

    it("should accept custom message", () => {
      const error = new DatabaseError("custom db error");
      expect(error.message).toBe("custom db error");
    });
  });

  describe("TransactionError", () => {
    it("should have statusCode 500", () => {
      const error = new TransactionError();
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("errors:unable_to_add_item");
    });
  });

  describe("ConfigurationError", () => {
    it("should have statusCode 500", () => {
      const error = new ConfigurationError();
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("common:internal_error");
    });

    it("should accept custom message", () => {
      const error = new ConfigurationError("config error");
      expect(error.message).toBe("config error");
    });
  });
});
