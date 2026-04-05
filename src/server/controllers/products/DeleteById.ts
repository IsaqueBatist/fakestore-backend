import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from "yup";
import { Request, Response } from "express";
import { ProductService } from "../../services/products";
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

  const trx = await req.getTenantTrx!();
  await ProductService.deleteById(trx, id);
  await RedisService.invalidate(`t:${req.tenant!.id}:product:${id}`);
  await RedisService.invalidatePattern(`t:${req.tenant!.id}:product:list`);

  return res.status(StatusCodes.NO_CONTENT).send();
};
