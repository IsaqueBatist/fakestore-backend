import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { CategoryProvider } from "../../database/providers/categories";
import { validation } from "../../shared/middlewares/Validation";
import { BadRequestError } from "../../errors";
import { RedisService } from "../../shared/services";

interface IParamProps {
  id?: number;
}

export const deleteByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      id: yup.number().integer().required().moreThan(0),
    }),
  ),
}));

export const deleteById = async (req: Request<IParamProps>, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError("errors:param_required", { param: "id" });
  }

  await CategoryProvider.deleteById(id);
  await RedisService.invalidatePattern(`category`);
  await RedisService.invalidate(`category:${id}`);

  return res.status(StatusCodes.NO_CONTENT).send();
};
