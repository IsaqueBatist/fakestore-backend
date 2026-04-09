import { EtableNames } from "../../ETableNames";
import { IProduct_Comment } from "../../models";
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  DatabaseError,
} from "../../../errors";
import type { Knex as KnexType } from "knex";

export const updateComment = async (
  newComment: Omit<
    IProduct_Comment,
    "id_product_comment" | "product_id" | "user_id" | "tenant_id"
  >,
  userId: number,
  commentId: number,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const comment = await trx(EtableNames.product_comments)
      .select()
      .where("id_product_comment", commentId)
      .first();

    if (!comment)
      throw new NotFoundError("errors:not_found", { resource: "Comment" });

    if (Number(comment.user_id) !== userId)
      throw new ForbiddenError("errors:forbidden_action", {
        action: "edit",
        resource: "comment",
      });

    const updatedRows = await trx(EtableNames.product_comments)
      .where("id_product_comment", commentId)
      .update(newComment);

    if (updatedRows > 0) return;

    throw new DatabaseError("errors:db_error_updating", {
      resource: "comment",
    });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_updating", {
      resource: "comment",
    });
  }
};
