import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ProductService } from "../../services/products";
import { validation } from "../../shared/middlewares";
import { BadRequestError } from "../../errors";
import { RedisService } from "../../shared/services";

interface IParamsProps {
  id?: number;
  category_id?: number;
}

export const deleteCategoryValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      id: yup.number().optional(),
      category_id: yup.number().optional(),
    }),
  ),
}));

export const deleteCategory = async (
  req: Request<IParamsProps>,
  res: Response,
) => {
  const { category_id, id } = req.params;

  if (!id) {
    throw new BadRequestError("errors:param_required", { param: "id" });
  }
  if (!category_id) {
    throw new BadRequestError("errors:param_required", { param: "category_id" });
  }

  const trx = await req.getTenantTrx!();
  await ProductService.deleteCategory(trx, category_id, id);
  await RedisService.invalidatePattern(`t:${req.tenant!.id}:product:list`);
  await RedisService.invalidatePattern(`t:${req.tenant!.id}:product:${id}`);

  return res.status(StatusCodes.NO_CONTENT).send();
};
