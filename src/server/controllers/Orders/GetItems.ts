import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares";
import * as yup from "yup";
import { UnauthorizedError } from "../../errors";
import { RedisService } from "../../shared/services";
interface IParamProps {
  order_id?: number;
}

export const getByIdValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      order_id: yup.number().optional().moreThan(0),
    }),
  ),
}));

export const getItems = async (req: Request<IParamProps>, res: Response) => {
  const userId = req.user?.id;
  const { order_id } = req.params;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  const userCartKey = `t:${req.tenant!.id}:cart:${userId}`;
  const rowData = await RedisService.hgetall(userCartKey);
  const userCart: Record<string, number> = {};
  for (const [prod, qtd] of Object.entries(rowData)) {
    userCart[prod] = Number(qtd);
  }

  return res.status(StatusCodes.OK).json(userCart);
};
