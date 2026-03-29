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

interface IBodyProps extends Omit<
  IProduct_Comment,
  "product_id" | "id_product_comment" | "user_id"
> {}
interface IParamsPropos {
  id?: number;
  comment_id?: number;
}

export const updateCommentValidation = validation((getSchema) => ({
  params: getSchema<IParamsPropos>(
    yup.object().shape({
      id: yup.number().required(),
      comment_id: yup.number().required(),
    }),
  ),
  body: getSchema<IBodyProps>(
    yup.object().shape({
      comment: yup.string().required(),
    }),
  ),
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const updatComment = async (
  req: Request<IParamsPropos, {}, IBodyProps>,
  res: Response,
) => {
  if (!req.params.id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }
  if (!req.params.comment_id) {
    throw new BadRequestError("The comment_id parameter needs to be entered");
  }
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  await ProductProvider.UpdateComment(req.body, userId, req.params.comment_id);

  return res.status(StatusCodes.NO_CONTENT).send();
};
