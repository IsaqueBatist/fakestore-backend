import { ensureAdmin } from "../../../src/server/shared/middlewares/EnsureAdmin";
import { ForbiddenError } from "../../../src/server/errors";
import { mockRequest, mockResponse, mockNext } from "../../helpers/mockRequest";

describe("EnsureAdmin Middleware", () => {
  it("should throw ForbiddenError when user role is not admin", () => {
    const req = mockRequest({ user: { id: 1, role: "user" } });
    const res = mockResponse();
    const next = mockNext();

    expect(() => ensureAdmin(req as any, res as any, next)).toThrow(
      ForbiddenError,
    );
  });

  it("should throw ForbiddenError when req.user is undefined", () => {
    const req = mockRequest({ user: undefined });
    const res = mockResponse();
    const next = mockNext();

    expect(() => ensureAdmin(req as any, res as any, next)).toThrow(
      ForbiddenError,
    );
  });

  it("should call next() when user role is admin", () => {
    const req = mockRequest({ user: { id: 1, role: "admin" } });
    const res = mockResponse();
    const next = mockNext();

    ensureAdmin(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
  });
});
