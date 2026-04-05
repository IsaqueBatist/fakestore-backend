import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ProductService } from "../../services/products";
import { validation } from "../../shared/middlewares";
import { BadRequestError, UnauthorizedError } from "../../errors";

interface IParamsProps {
  id?: number;
  comment_id?: number;
}

export const deleteCommentValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      id: yup.number().optional(),
      comment_id: yup.number().optional(),
    }),
  ),
}));

export const deleteComment = async (
  req: Request<IParamsProps>,
  res: Response,
) => {
  const { comment_id, id } = req.params;

  if (!id) {
    throw new BadRequestError("errors:param_required", { param: "id" });
  }
  if (!comment_id) {
    throw new BadRequestError("errors:param_required", { param: "comment_id" });
  }
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  const trx = await req.getTenantTrx!();
  await ProductService.deleteComment(trx, comment_id, id, userId);

  return res.status(StatusCodes.NO_CONTENT).send();
};
