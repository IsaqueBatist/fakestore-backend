import { UnauthorizedError } from "../../../src/server/errors";
import { mockRequest, mockResponse, mockNext } from "../../helpers/mockRequest";

// Mock the Knex instance
const mockKnexWhere = jest.fn().mockReturnThis();
const mockKnexFirst = jest.fn();
const mockKnex: any = jest.fn(() => ({
  where: mockKnexWhere,
  first: mockKnexFirst,
}));
mockKnex.transaction = jest.fn();
mockKnex.raw = jest.fn();

jest.mock("../../../src/server/database/knex", () => ({
  Knex: mockKnex,
}));

import { RedisService } from "../../../src/server/shared/services/RedisService";
import { ensureTenant } from "../../../src/server/shared/middlewares/EnsureTenant";

describe("EnsureTenant Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockKnexFirst.mockReset();
    mockKnexWhere.mockReturnThis();
  });

  it("should throw UnauthorizedError when x-api-key header is missing", async () => {
    const req = mockRequest({ headers: {} });
    const res = mockResponse();
    const next = mockNext();

    await expect(
      ensureTenant(req as any, res as any, next),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("should resolve tenant from Redis cache on cache hit", async () => {
    const cachedTenant = {
      id_tenant: 1,
      plan: "basic",
      rate_limit: 10,
      is_active: true,
    };
    (RedisService.get as jest.Mock).mockResolvedValueOnce(cachedTenant);

    const req = mockRequest({
      headers: { "x-api-key": "test-key" },
    });
    const res = mockResponse();
    const next = mockNext();

    await ensureTenant(req as any, res as any, next);

    expect(RedisService.get).toHaveBeenCalledWith(
      expect.stringContaining("tenant:hash:"),
    );
    expect(req.tenant).toEqual({
      id: 1,
      plan: "basic",
      rateLimit: 10,
    });
    expect(next).toHaveBeenCalled();
  });

  it("should fall back to DB when Redis cache misses", async () => {
    (RedisService.get as jest.Mock).mockResolvedValueOnce(null);
    mockKnexFirst.mockResolvedValueOnce({
      id_tenant: 2,
      plan: "agency",
      rate_limit: 50,
      is_active: true,
    });

    const req = mockRequest({
      headers: { "x-api-key": "another-key" },
    });
    const res = mockResponse();
    const next = mockNext();

    await ensureTenant(req as any, res as any, next);

    expect(RedisService.set).toHaveBeenCalled();
    expect(req.tenant).toEqual({
      id: 2,
      plan: "agency",
      rateLimit: 50,
    });
    expect(next).toHaveBeenCalled();
  });

  it("should throw UnauthorizedError for invalid API key (not found in DB)", async () => {
    (RedisService.get as jest.Mock).mockResolvedValueOnce(null);
    mockKnexFirst.mockResolvedValueOnce(undefined);

    const req = mockRequest({
      headers: { "x-api-key": "invalid-key" },
    });
    const res = mockResponse();
    const next = mockNext();

    await expect(
      ensureTenant(req as any, res as any, next),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("should provide getTenantTrx function on req", async () => {
    const cachedTenant = {
      id_tenant: 1,
      plan: "basic",
      rate_limit: 10,
    };
    (RedisService.get as jest.Mock).mockResolvedValueOnce(cachedTenant);

    const req = mockRequest({
      headers: { "x-api-key": "test-key" },
    });
    const res = mockResponse();
    const next = mockNext();

    await ensureTenant(req as any, res as any, next);

    expect(typeof req.getTenantTrx).toBe("function");
  });
});
