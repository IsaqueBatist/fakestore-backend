import { Request, Response, NextFunction } from "express";

export function mockRequest(
  overrides: Partial<Request> = {},
): Partial<Request> {
  return {
    headers: {},
    tenant: undefined,
    user: undefined,
    getTenantTrx: undefined,
    t: ((key: string) => key) as any,
    ...overrides,
  };
}

export function mockResponse(): Partial<Response> & {
  _statusCode: number;
  _json: unknown;
} {
  const res: any = {
    _statusCode: 200,
    _json: null,
    statusCode: 200,
    status: jest.fn(function (this: any, code: number) {
      this._statusCode = code;
      this.statusCode = code;
      return this;
    }),
    json: jest.fn(function (this: any, body: unknown) {
      this._json = body;
      return this;
    }),
    setHeader: jest.fn(),
    on: jest.fn(),
    send: jest.fn(function (this: any) {
      return this;
    }),
  };
  return res;
}

export function mockNext(): NextFunction {
  return jest.fn() as unknown as NextFunction;
}
