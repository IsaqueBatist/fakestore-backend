import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from "yup";
import { IProduct } from "../../database/models";
import { ProductService } from "../../services/products";
import { RedisService } from "../../shared/services";

interface IBodyProps extends Omit<IProduct, "id_product" | "created_at" | "tenant_id"> {}

export const createValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      name: yup.string().required().min(3).max(150),
      description: yup.string().required(),
      price: yup.number().required().moreThan(0),
      stock: yup.number().required().integer().min(0),
      image_url: yup.string().required(),
      rating: yup.number().required().moreThan(0),
      specifications: yup.object().required(),
    }),
  ),
}));

export const create = async (req: Request<{}, {}, IProduct>, res: Response) => {
  const trx = await req.getTenantTrx!();
  const result = await ProductService.create(trx, req.body);
  await RedisService.invalidatePattern(`t:${req.tenant!.id}:product:list`);
  return res.status(StatusCodes.CREATED).json(result);
};
