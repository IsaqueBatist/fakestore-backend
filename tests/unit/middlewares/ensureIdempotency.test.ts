import { BadRequestError } from "../../../src/server/errors";
import { mockRequest, mockResponse, mockNext } from "../../helpers/mockRequest";

const mockKnexWhere = jest.fn().mockReturnThis();
const mockKnexFirst = jest.fn();
const mockKnexInsert = jest.fn().mockReturnThis();
const mockKnexCatch = jest.fn().mockResolvedValue(undefined);
const mockKnex: any = jest.fn(() => ({
  where: mockKnexWhere,
  first: mockKnexFirst,
  insert: mockKnexInsert,
  catch: mockKnexCatch,
}));
mockKnex.transaction = jest.fn();

jest.mock("../../../src/server/database/knex", () => ({
  Knex: mockKnex,
}));

import { ensureIdempotency } from "../../../src/server/shared/middlewares/EnsureIdempotency";

describe("EnsureIdempotency Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockKnexWhere.mockReturnThis();
    mockKnexInsert.mockReturnThis();
    mockKnexCatch.mockResolvedValue(undefined);
  });

  it("should throw BadRequestError when Idempotency-Key header is missing", async () => {
    const req = mockRequest({
      headers: {},
      tenant: { id: 1, plan: "basic", rateLimit: 10 },
    });
    const res = mockResponse();
    const next = mockNext();

    await expect(
      ensureIdempotency(req as any, res as any, next),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("should return cached response when key already exists", async () => {
    const cachedBody = { id: 1, status: "created" };
    mockKnexFirst.mockResolvedValueOnce({
      response_code: 201,
      response_body: JSON.stringify(cachedBody),
    });

    const req = mockRequest({
      headers: { "idempotency-key": "test-key-123" },
      tenant: { id: 1, plan: "basic", rateLimit: 10 },
    });
    const res = mockResponse();
    const next = mockNext();

    await ensureIdempotency(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(cachedBody);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() when key is new", async () => {
    mockKnexFirst.mockResolvedValueOnce(undefined);

    const req = mockRequest({
      headers: { "idempotency-key": "new-key-456" },
      tenant: { id: 1, plan: "basic", rateLimit: 10 },
    });
    const res = mockResponse();
    const next = mockNext();

    await ensureIdempotency(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
  });

  it("should call next() when req.tenant is undefined", async () => {
    const req = mockRequest({
      headers: { "idempotency-key": "some-key" },
      tenant: undefined,
    });
    const res = mockResponse();
    const next = mockNext();

    await ensureIdempotency(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
  });
});
