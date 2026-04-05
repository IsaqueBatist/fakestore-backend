import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { IAddress } from "../../database/models/Addresses";
import { AddressProvider } from "../../database/providers/addresses";
import { validation } from "../../shared/middlewares/Validation";
import { BadRequestError, UnauthorizedError } from "../../errors";

interface IParamProps {
  id?: number;
}
interface IBodyProps extends Omit<IAddress, "id_address" | "user_id"> {}

export const updateByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      id: yup.number().integer().required().moreThan(0),
    }),
  ),
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

export const updateById = async (req: Request<IParamProps>, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  await AddressProvider.updateById(id, req.body, userId);

  return res.status(StatusCodes.NO_CONTENT).send();
};
