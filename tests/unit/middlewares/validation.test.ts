import * as yup from "yup";
import { validation } from "../../../src/server/shared/middlewares/Validation";
import { ApiValidationError } from "../../../src/server/shared/middlewares/ApiValidationError";
import { mockRequest, mockResponse, mockNext } from "../../helpers/mockRequest";

describe("Validation Middleware", () => {
  it("should call next() when body matches schema", () => {
    const middleware = validation((getSchema) => ({
      body: getSchema(
        yup.object().shape({
          email: yup.string().required().email(),
          password: yup.string().required().min(6),
        }),
      ),
    }));

    const req = mockRequest({
      body: { email: "test@test.com", password: "123456" },
    } as any);
    const res = mockResponse();
    const next = mockNext();

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith(); // called without error
  });

  it("should call next with ApiValidationError when body fails validation", () => {
    const middleware = validation((getSchema) => ({
      body: getSchema(
        yup.object().shape({
          email: yup.string().required().email(),
          password: yup.string().required().min(6),
        }),
      ),
    }));

    const req = mockRequest({
      body: { email: "not-an-email", password: "12" },
    } as any);
    const res = mockResponse();
    const next = mockNext();

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiValidationError));
  });

  it("should validate multiple properties (body + query)", () => {
    const middleware = validation((getSchema) => ({
      body: getSchema(
        yup.object().shape({
          name: yup.string().required(),
        }),
      ),
      query: getSchema(
        yup.object().shape({
          page: yup.number().required(),
        }),
      ),
    }));

    const req = mockRequest({
      body: {},
      query: {},
    } as any);
    const res = mockResponse();
    const next = mockNext();

    middleware(req as any, res as any, next);

    const errorArg = (next as jest.Mock).mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(ApiValidationError);
    expect(errorArg.errors).toHaveProperty("body");
    expect(errorArg.errors).toHaveProperty("query");
  });

  it("should include field-level errors in ApiValidationError", () => {
    const middleware = validation((getSchema) => ({
      body: getSchema(
        yup.object().shape({
          email: yup.string().required("Email is required"),
          name: yup.string().required("Name is required"),
        }),
      ),
    }));

    const req = mockRequest({ body: {} } as any);
    const res = mockResponse();
    const next = mockNext();

    middleware(req as any, res as any, next);

    const errorArg = (next as jest.Mock).mock.calls[0][0];
    expect(errorArg.errors.body).toHaveProperty("email");
    expect(errorArg.errors.body).toHaveProperty("name");
  });
});
