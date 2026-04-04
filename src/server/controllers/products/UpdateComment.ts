import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ProductProvider } from "../../database/providers/products";
import { validation } from "../../shared/middlewares";
import { IProduct_Comment } from "../../database/models";
import {
  BadRequestError,
  DatabaseError,
  UnauthorizedError,
} from "../../errors";
import { RedisService } from "../../shared/services";

interface IBodyProps extends Omit<
  IProduct_Comment,
  "product_id" | "id_product_comment" | "user_id"
> {}
interface IParamsPropos {
  comment_id?: number;
}

export const updateCommentValidation = validation((getSchema) => ({
  params: getSchema<IParamsPropos>(
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

export const updatComment = async (
  req: Request<IParamsPropos, {}, IBodyProps>,
  res: Response,
) => {
  const { comment_id } = req.params;
  if (!comment_id) {
    throw new BadRequestError("The comment_id parameter needs to be entered");
  }
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  await ProductProvider.UpdateComment(req.body, userId, comment_id);
  await RedisService.invalidatePattern("products:all");

  return res.status(StatusCodes.NO_CONTENT).send();
};
