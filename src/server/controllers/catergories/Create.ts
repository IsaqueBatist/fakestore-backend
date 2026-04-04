import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ICategory } from "../../database/models";
import { CategoryProvider } from "../../database/providers/categories";
import { validation } from "../../shared/middlewares/Validation";
import { RedisService } from "../../shared/services";

interface IBodyProps extends Omit<ICategory, "id_category"> {}

export const createValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      name: yup.string().required().min(3).max(150),
      description: yup.string().required(),
    }),
  ),
}));

export const create = async (
  req: Request<{}, {}, ICategory>,
  res: Response,
) => {
  const result = await CategoryProvider.create(req.body);
  await RedisService.invalidatePattern(`category`);

  return res.status(StatusCodes.CREATED).json(result);
};
