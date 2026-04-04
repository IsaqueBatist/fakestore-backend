import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { IAddress } from "../../database/models/Addresses";
import { AddressProvider } from "../../database/providers/addresses";
import { validation } from "../../shared/middlewares/Validation";
import { UnauthorizedError } from "../../errors";

interface IBodyProps extends Omit<IAddress, "id_address" | "user_id"> {}

export const createValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      street: yup.string().required(),
      city: yup.string().required(),
      state: yup.string().required(),
      zip_code: yup
        .string()
        .required()
        .matches(/^\d{5}-?\d{3}$/, "CEP deve estar no formato 00000-000"),
      country: yup.string().required(),
    }),
  ),
}));

export const create = async (req: Request<{}, {}, IAddress>, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  const result = await AddressProvider.create(req.body, userId);

  return res.status(StatusCodes.CREATED).json(result);
};
