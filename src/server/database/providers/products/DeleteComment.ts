import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  DatabaseError,
} from "../../../errors";

export const deleteComment = async (
  commentId: number,
  productId: number,
  userId: number,
): Promise<void> => {
  try {
    const comment = await Knex(EtableNames.product_comments)
      .select()
      .where("id_product_comment", commentId)
      .first();

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenError("You cant delete this comment");
    }

    const result = await Knex(EtableNames.product_comments)
      .where("product_id", productId)
      .andWhere("id_product_comment", commentId)
      .del();

    if (result !== 0) return;

    throw new BadRequestError(`Error deleting category of product`);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Database error while add detail to product`);
  }
};
