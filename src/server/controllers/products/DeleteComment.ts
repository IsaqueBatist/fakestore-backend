import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ProductProvider } from "../../database/providers/products";
import { validation } from "../../shared/middlewares";
import { BadRequestError, UnauthorizedError } from "../../errors";

interface IParamsPropos {
  id?: number;
  comment_id?: number;
}

export const deleteCommentValidation = validation((getSchema) => ({
  params: getSchema<IParamsPropos>(
    yup.object().shape({
      id: yup.number().optional(),
      comment_id: yup.number().optional(),
    }),
  ),
}));

export const deleteComment = async (
  req: Request<IParamsPropos>,
  res: Response,
) => {
  const { comment_id, id } = req.params;

  if (!id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }
  if (!comment_id) {
    throw new BadRequestError("The comment_id parameter needs to be entered");
  }
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  await ProductProvider.deleteComment(comment_id, id, userId);

  return res.status(StatusCodes.NO_CONTENT).send();
};
