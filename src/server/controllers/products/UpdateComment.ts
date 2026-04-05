import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ProductService } from "../../services/products";
import { validation } from "../../shared/middlewares";
import { IProduct_Comment } from "../../database/models";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../errors";
import { RedisService } from "../../shared/services";

interface IBodyProps extends Omit<
  IProduct_Comment,
  "product_id" | "id_product_comment" | "user_id" | "tenant_id"
> {}
interface IParamsProps {
  comment_id?: number;
}

export const updateCommentValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      comment_id: yup.number().required(),
    }),
  ),
  body: getSchema<IBodyProps>(
    yup.object().shape({
      comment: yup.string().required(),
    }),
  ),
}));

export const updateComment = async (
  req: Request<IParamsProps, {}, IBodyProps>,
  res: Response,
) => {
  const { comment_id } = req.params;
  if (!comment_id) {
    throw new BadRequestError("errors:param_required", { param: "comment_id" });
  }
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  const trx = await req.getTenantTrx!();
  await ProductService.updateComment(trx, req.body, userId, comment_id);
  await RedisService.invalidatePattern(`t:${req.tenant!.id}:products:all`);

  return res.status(StatusCodes.NO_CONTENT).send();
};
