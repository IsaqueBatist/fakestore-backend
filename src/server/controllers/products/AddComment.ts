import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { ProductProvider } from "../../database/providers/products";
import { validation } from "../../shared/middlewares";
import { IProduct_Comment } from "../../database/models";
import { BadRequestError, UnauthorizedError } from "../../errors";
import { RedisService } from "../../shared/services";

interface IBodyProps extends Omit<
  IProduct_Comment,
  "product_id" | "id_product_comment" | "user_id"
> {}
interface IParamsProps {
  id?: number;
}

export const addCommentValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      id: yup.number().required(),
    }),
  ),
  body: getSchema<IBodyProps>(
    yup.object().shape({
      comment: yup.string().required(),
    }),
  ),
}));

export const addComment = async (
  req: Request<IParamsProps, {}, IBodyProps>,
  res: Response,
) => {
  const { id } = req.params;

  if (!id) throw new BadRequestError("errors:param_required", { param: "id" });

  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("errors:user_not_logged_in");
  }

  const result = await ProductProvider.addComment(id, req.body, userId);

  await RedisService.invalidatePattern(`product:${id}`);
  await RedisService.invalidatePattern(`product:list`);

  return res.status(StatusCodes.CREATED).json(result);
};
