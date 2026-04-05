import { RedisService } from "../../../src/server/shared/services/RedisService";
import { tenantRateLimiter } from "../../../src/server/shared/middlewares/TenantRateLimiter";
import { mockRequest, mockResponse, mockNext } from "../../helpers/mockRequest";

describe("TenantRateLimiter Middleware", () => {
  it("should call next() when request count is under limit", async () => {
    (RedisService.rateLimitCheck as jest.Mock).mockResolvedValueOnce(1);

    const req = mockRequest({
      tenant: { id: 1, plan: "basic", rateLimit: 10 },
    });
    const res = mockResponse();
    const next = mockNext();

    await tenantRateLimiter(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 10);
    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", 9);
  });

  it("should return 429 when request count exceeds limit", async () => {
    (RedisService.rateLimitCheck as jest.Mock).mockResolvedValueOnce(11);

    const req = mockRequest({
      tenant: { id: 1, plan: "basic", rateLimit: 10 },
    });
    const res = mockResponse();
    const next = mockNext();

    await tenantRateLimiter(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.objectContaining({ default: expect.any(String) }),
      }),
    );
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", "1");
    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", "0");
  });

  it("should pass through when req.tenant is undefined", async () => {
    const req = mockRequest({ tenant: undefined });
    const res = mockResponse();
    const next = mockNext();

    await tenantRateLimiter(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(RedisService.rateLimitCheck).not.toHaveBeenCalled();
  });

  it("should pass through on Redis failure (non-fatal)", async () => {
    (RedisService.rateLimitCheck as jest.Mock).mockRejectedValueOnce(
      new Error("Redis connection error"),
    );

    const req = mockRequest({
      tenant: { id: 1, plan: "basic", rateLimit: 10 },
    });
    const res = mockResponse();
    const next = mockNext();

    await tenantRateLimiter(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
  });

  it("should use tenant-specific key with tenant id (not global)", async () => {
    (RedisService.rateLimitCheck as jest.Mock).mockResolvedValueOnce(1);

    const req = mockRequest({
      tenant: { id: 42, plan: "agency", rateLimit: 50 },
    });
    const res = mockResponse();
    const next = mockNext();

    await tenantRateLimiter(req as any, res as any, next);

    expect(RedisService.rateLimitCheck).toHaveBeenCalledWith(
      "ratelimit:42", // key contains tenant id
      expect.any(Number),
      1000, // 1 second window
    );
  });

  it("should set X-RateLimit-Limit header reflecting tenant plan limit", async () => {
    // Sandbox plan: rate_limit = 2
    (RedisService.rateLimitCheck as jest.Mock).mockResolvedValueOnce(1);

    const req = mockRequest({
      tenant: { id: 1, plan: "sandbox", rateLimit: 2 },
    });
    const res = mockResponse();
    const next = mockNext();

    await tenantRateLimiter(req as any, res as any, next);

    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 2);
    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", 1);
  });

  it("should correctly calculate remaining requests", async () => {
    (RedisService.rateLimitCheck as jest.Mock).mockResolvedValueOnce(8);

    const req = mockRequest({
      tenant: { id: 1, plan: "basic", rateLimit: 10 },
    });
    const res = mockResponse();
    const next = mockNext();

    await tenantRateLimiter(req as any, res as any, next);

    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", 2);
  });
});
