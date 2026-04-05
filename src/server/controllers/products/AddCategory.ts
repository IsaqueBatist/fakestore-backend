import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ProductService } from "../../services/products";
import { validation } from "../../shared/middlewares";
import { IProduct_Category } from "../../database/models/Product_category";
import { BadRequestError } from "../../errors";
import { RedisService } from "../../shared/services";

interface IBodyProps extends Omit<IProduct_Category, "product_id" | "tenant_id"> {}
interface IParamsProps {
  id?: number;
}

export const addCategoryValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      id: yup.number().required(),
    }),
  ),
  body: getSchema<IBodyProps>(
    yup.object().shape({
      category_id: yup.number().moreThan(0).required(),
    }),
  ),
}));

export const addCategory = async (
  req: Request<IParamsProps, {}, IBodyProps>,
  res: Response,
) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError("errors:param_required", { param: "id" });
  }

  const trx = await req.getTenantTrx!();
  const result = await ProductService.addCategory(trx, id, req.body.category_id);

  await RedisService.invalidatePattern(`t:${req.tenant!.id}:product:${id}`);
  await RedisService.invalidatePattern(`t:${req.tenant!.id}:product:list`);

  return res.status(StatusCodes.CREATED).json(result);
};
