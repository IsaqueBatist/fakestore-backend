import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ObjectSchema, ValidationError } from "yup";
import { ApiValidationError } from "./ApiValidationError";

type Tproperty = "body" | "header" | "params" | "query";

type TAllSchemas = Record<Tproperty, ObjectSchema<any>>;

type TGetSchema = <T extends yup.Maybe<yup.AnyObject>>(
  schema: ObjectSchema<T>,
) => ObjectSchema<T>;

type TGetAllSchema = (getSchema: TGetSchema) => Partial<TAllSchemas>;

type Tvalidation = (getAllSchemas: TGetAllSchema) => RequestHandler;

export const validation: Tvalidation = (getAllSchemas) => (req, res, next) => {
  const schemas = getAllSchemas((schema) => schema);
  const errorsResult: Record<string, Record<string, string>> = {};

  Object.entries(schemas).forEach(([key, schema]) => {
    try {
      schema.validateSync(req[key as Tproperty], {
        abortEarly: false,
      });
    } catch (err) {
      const yupError = err as ValidationError;
      const errors: Record<string, string> = {};

      yupError.inner.forEach((error) => {
        if (!error.path) return;
        errors[error.path] = req.t(
          error.message,
          error.params as Record<string, string>,
        );
      });

      errorsResult[key] = errors;
    }
  });

  if (Object.entries(errorsResult).length === 0) {
    return next();
  }

  return next(new ApiValidationError(errorsResult));
};
