import { UnauthorizedError } from "../../../src/server/errors";
import { mockRequest, mockResponse, mockNext } from "../../helpers/mockRequest";

const mockKnexWhere = jest.fn().mockReturnThis();
const mockKnexFirst = jest.fn();
const mockKnex: any = jest.fn(() => ({
  where: mockKnexWhere,
  first: mockKnexFirst,
}));
mockKnex.transaction = jest.fn();

jest.mock("../../../src/server/database/knex", () => ({
  Knex: mockKnex,
}));

jest.mock("../../../src/server/shared/services/PasswordCrypto", () => ({
  passwordCrypto: {
    verifyPassword: jest.fn(),
  },
}));

import { ensureApiSecret } from "../../../src/server/shared/middlewares/EnsureApiSecret";
import { passwordCrypto } from "../../../src/server/shared/services/PasswordCrypto";

describe("EnsureApiSecret Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockKnexWhere.mockReturnThis();
  });

  it("should throw UnauthorizedError when req.tenant is missing", async () => {
    const req = mockRequest({ tenant: undefined });
    const res = mockResponse();
    const next = mockNext();

    await expect(
      ensureApiSecret(req as any, res as any, next),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("should throw UnauthorizedError when x-api-secret header is missing", async () => {
    const req = mockRequest({
      tenant: { id: 1, plan: "basic", rateLimit: 10 },
      headers: {},
    });
    const res = mockResponse();
    const next = mockNext();

    await expect(
      ensureApiSecret(req as any, res as any, next),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("should throw UnauthorizedError when tenant not found in DB", async () => {
    mockKnexFirst.mockResolvedValueOnce(undefined);

    const req = mockRequest({
      tenant: { id: 1, plan: "basic", rateLimit: 10 },
      headers: { "x-api-secret": "some-secret" },
    });
    const res = mockResponse();
    const next = mockNext();

    await expect(
      ensureApiSecret(req as any, res as any, next),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("should throw UnauthorizedError when secret does not match hash", async () => {
    mockKnexFirst.mockResolvedValueOnce({
      id_tenant: 1,
      api_secret_hash: "$2a$10$hashvalue",
      is_active: true,
    });
    (passwordCrypto.verifyPassword as jest.Mock).mockResolvedValueOnce(false);

    const req = mockRequest({
      tenant: { id: 1, plan: "basic", rateLimit: 10 },
      headers: { "x-api-secret": "wrong-secret" },
    });
    const res = mockResponse();
    const next = mockNext();

    await expect(
      ensureApiSecret(req as any, res as any, next),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("should call next() when secret matches", async () => {
    mockKnexFirst.mockResolvedValueOnce({
      id_tenant: 1,
      api_secret_hash: "$2a$10$hashvalue",
      is_active: true,
    });
    (passwordCrypto.verifyPassword as jest.Mock).mockResolvedValueOnce(true);

    const req = mockRequest({
      tenant: { id: 1, plan: "basic", rateLimit: 10 },
      headers: { "x-api-secret": "correct-secret" },
    });
    const res = mockResponse();
    const next = mockNext();

    await ensureApiSecret(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
  });
});
