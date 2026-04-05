import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from "yup";
import { Request, Response } from "express";
import { ProductProvider } from "../../database/providers/products";
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
  if (!id) throw new BadRequestError("errors:param_required", { param: "id" });

  await ProductProvider.deleteById(id);
  await RedisService.invalidate(`product:${id}`);
  await RedisService.invalidatePattern(`product:list`);

  return res.status(StatusCodes.NO_CONTENT).send();
};
