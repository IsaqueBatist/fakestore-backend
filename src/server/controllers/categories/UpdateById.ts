import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ICategory } from "../../database/models";
import { CategoryProvider } from "../../database/providers/categories";
import { validation } from "../../shared/middlewares/Validation";
import { BadRequestError } from "../../errors";
import { RedisService } from "../../shared/services";

interface IParamProps {
  id?: number;
}
interface IBodyProps extends Omit<ICategory, "id_category"> {}

export const updateByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      id: yup.number().integer().required().moreThan(0),
    }),
  ),
  body: getSchema<IBodyProps>(
    yup.object().shape({
      name: yup.string().required().min(3).max(150),
      description: yup.string().required(),
    }),
  ),
}));

export const updateById = async (req: Request<IParamProps>, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }
  await CategoryProvider.updateById(id, req.body);
  await RedisService.invalidate(`category:${id}`);
  await RedisService.invalidatePattern(`category:all`);

  return res.status(StatusCodes.NO_CONTENT).send();
};
