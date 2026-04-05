import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OrderService } from "../../services/orders";
import { validation } from "../../shared/middlewares";
import * as yup from "yup";
import { BadRequestError, UnauthorizedError } from "../../errors";

interface IParamProps {
  id?: number;
}

export const getByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      id: yup.number().optional().moreThan(0),
    }),
  ),
}));

export const getById = async (req: Request<IParamProps>, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError("errors:param_required", { param: "id" });
  }

  const trx = await req.getTenantTrx!();
  const result = await OrderService.getById(trx, id, userId);

  return res.status(StatusCodes.OK).json(result);
};
