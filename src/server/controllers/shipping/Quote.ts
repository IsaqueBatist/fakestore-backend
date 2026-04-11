import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { quoteShipping } from "../../services/shipping/ShippingService";

interface IBodyProps {
  from_postal_code: string;
  to_postal_code: string;
  weight: number;
  height: number;
  width: number;
  length: number;
  insurance_value_cents: number;
}

export const quoteValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      from_postal_code: yup
        .string()
        .required()
        .matches(/^\d{8}$/, "CEP must be 8 digits"),
      to_postal_code: yup
        .string()
        .required()
        .matches(/^\d{8}$/, "CEP must be 8 digits"),
      weight: yup.number().required().moreThan(0).max(30),
      height: yup.number().required().moreThan(0).max(105),
      width: yup.number().required().moreThan(0).max(105),
      length: yup.number().required().moreThan(0).max(105),
      insurance_value_cents: yup.number().required().integer().min(0),
    }),
  ),
}));

export const quote = async (req: Request<{}, {}, IBodyProps>, res: Response) => {
  const quotes = await quoteShipping(req.body);
  return res.status(StatusCodes.OK).json({ data: quotes });
};
