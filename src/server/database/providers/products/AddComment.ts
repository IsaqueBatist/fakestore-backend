import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Comment } from "../../models";
import {
  AppError,
  NotFoundError,
  BadRequestError,
  DatabaseError,
} from "../../../errors";

export const addComment = async (
  productId: number,
  comment: Omit<
    IProduct_Comment,
    "id_product_comment" | "product_id" | "user_id"
  >,
  userId: number,
): Promise<number> => {
  try {
    const product = await Knex(EtableNames.products)
      .select("id_product")
      .where("id_product", productId)
      .first();

    if (!product) {
      throw new NotFoundError(`Product`);
    }

    const [newComment] = await Knex(EtableNames.product_comments)
      .insert({ ...comment, product_id: productId, user_id: userId })
      .returning("id_product_comment");

    if (!newComment) {
      throw new BadRequestError(`Erro inserting new Comment`);
    }

    return newComment.id_product_comment;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Database error while add comment to product`);
  }
};
