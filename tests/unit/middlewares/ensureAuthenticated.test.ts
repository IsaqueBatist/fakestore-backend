import { ensureAuthenticated } from "../../../src/server/shared/middlewares/EnsureAuthenticated";
import { JWTService } from "../../../src/server/shared/services/JWTService";
import { UnauthorizedError } from "../../../src/server/errors";
import { mockRequest, mockResponse, mockNext } from "../../helpers/mockRequest";

describe("EnsureAuthenticated Middleware", () => {
  it("should throw UnauthorizedError when authorization header is missing", async () => {
    const req = mockRequest({ headers: {} });
    const res = mockResponse();
    const next = mockNext();

    await expect(
      ensureAuthenticated(req as any, res as any, next),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("should throw UnauthorizedError when token type is not Bearer", async () => {
    const req = mockRequest({
      headers: { authorization: "Basic some-token" },
    });
    const res = mockResponse();
    const next = mockNext();

    await expect(
      ensureAuthenticated(req as any, res as any, next),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("should throw UnauthorizedError when token is invalid", async () => {
    const req = mockRequest({
      headers: { authorization: "Bearer invalid-token" },
    });
    const res = mockResponse();
    const next = mockNext();

    await expect(
      ensureAuthenticated(req as any, res as any, next),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("should throw UnauthorizedError when JWT tenant_id does not match req.tenant.id", async () => {
    const token = JWTService.sign({ uid: 1, role: "user", tid: 1 });
    const req = mockRequest({
      headers: { authorization: `Bearer ${token}` },
      tenant: { id: 999, plan: "basic", rateLimit: 10 },
    });
    const res = mockResponse();
    const next = mockNext();

    await expect(
      ensureAuthenticated(req as any, res as any, next),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("should set req.user and call next() on valid token", async () => {
    const token = JWTService.sign({ uid: 42, role: "admin", tid: 5 });
    const req = mockRequest({
      headers: { authorization: `Bearer ${token}` },
      tenant: { id: 5, plan: "basic", rateLimit: 10 },
    });
    const res = mockResponse();
    const next = mockNext();

    await ensureAuthenticated(req as any, res as any, next);

    expect(req.user).toEqual({ id: 42, role: "admin" });
    expect(next).toHaveBeenCalled();
  });

  it("should work when req.tenant is undefined (no cross-tenant check)", async () => {
    const token = JWTService.sign({ uid: 1, role: "user", tid: 1 });
    const req = mockRequest({
      headers: { authorization: `Bearer ${token}` },
      tenant: undefined,
    });
    const res = mockResponse();
    const next = mockNext();

    await ensureAuthenticated(req as any, res as any, next);

    expect(req.user).toEqual({ id: 1, role: "user" });
    expect(next).toHaveBeenCalled();
  });
});
