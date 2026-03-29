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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteComment = async (
  req: Request<IParamsPropos>,
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

  await ProductProvider.deleteComment(
    req.params.comment_id,
    req.params.id,
    userId,
  );

  return res.status(StatusCodes.NO_CONTENT).send();
};
