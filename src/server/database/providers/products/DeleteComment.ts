import { EtableNames } from "../../ETableNames";
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  DatabaseError,
} from "../../../errors";
import type { Knex as KnexType } from "knex";

export const deleteComment = async (
  commentId: number,
  productId: number,
  userId: number,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const comment = await trx(EtableNames.product_comments)
      .select()
      .where("id_product_comment", commentId)
      .first();

    if (!comment) {
      throw new NotFoundError("errors:not_found", { resource: "Comment" });
    }

    if (Number(comment.user_id) !== userId) {
      throw new ForbiddenError("errors:forbidden_action", {
        action: "delete",
        resource: "comment",
      });
    }

    const result = await trx(EtableNames.product_comments)
      .where("product_id", productId)
      .andWhere("id_product_comment", commentId)
      .del();

    if (result !== 0) return;

    throw new DatabaseError("errors:db_error_deleting", {
      resource: "comment",
    });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_deleting", {
      resource: "comment",
    });
  }
};
