import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Comment } from "../../models";
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  DatabaseError,
} from "../../../errors";

export const updateComment = async (
  newComment: Omit<
    IProduct_Comment,
    "id_product_comment" | "product_id" | "user_id"
  >,
  userId: number,
  commentId: number,
): Promise<void> => {
  try {
    const comment = await Knex(EtableNames.product_comments)
      .select()
      .where("id_product_comment", commentId)
      .first();

    if (!comment) throw new NotFoundError("Comment not found");

    if (Number(comment.user_id) !== userId)
      throw new ForbiddenError("You cant edit this comment");

    const updatedRows = await Knex(EtableNames.product_comments)
      .where("id_product_comment", commentId)
      .update(newComment);

    if (updatedRows > 0) return;

    throw new DatabaseError("Error updating comment");
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Error updating comment`);
  }
};
