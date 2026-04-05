import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from "yup";
import { Request, Response } from "express";
import { ProductService } from "../../services/products";
import { CACHE_TTL } from "../../shared/constants";
import { BadRequestError } from "../../errors";
import { RedisService } from "../../shared/services";

interface IParamProps {
  id?: number;
}

export const getByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      id: yup.number().integer().required().moreThan(0),
    }),
  ),
}));

export const getById = async (req: Request<IParamProps>, res: Response) => {
  const { id } = req.params;

  if (!id) throw new BadRequestError("errors:param_required", { param: "id" });

  const productCacheKey = `product:${id}`;

  const productCacheData = await RedisService.get(productCacheKey);

  if (productCacheData)
    return res.status(StatusCodes.OK).json(productCacheData);

  const trx = await req.getTenantTrx!();
  const result = await ProductService.getById(trx, id);

  await RedisService.set(productCacheKey, result, CACHE_TTL.ONE_HOUR);

  return res.status(StatusCodes.OK).json(result);
};
