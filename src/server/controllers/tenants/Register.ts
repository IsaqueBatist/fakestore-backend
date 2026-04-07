import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { TenantService } from "../../services/tenants";

interface IBodyProps {
  name: string;
  slug: string;
  owner_name: string;
  owner_email: string;
  owner_password: string;
}

export const registerValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      name: yup.string().required().min(3).max(150),
      slug: yup
        .string()
        .required()
        .min(3)
        .max(100)
        .matches(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Slug must be lowercase alphanumeric with hyphens only",
        ),
      owner_name: yup.string().required().min(3),
      owner_email: yup.string().required().email().min(5),
      owner_password: yup.string().required().min(8),
    }),
  ),
}));

export const register = async (
  req: Request<{}, {}, IBodyProps>,
  res: Response,
) => {
  const result = await TenantService.register(req.body);

  return res.status(StatusCodes.CREATED).json(result);
};
