import { EtableNames } from "../../ETableNames";
import { IProduct_Comment } from "../../models";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const addComment = async (
  productId: number,
  comment: Omit<
    IProduct_Comment,
    "id_product_comment" | "product_id" | "user_id" | "tenant_id"
  >,
  userId: number,
  trx: KnexType.Transaction,
): Promise<number> => {
  try {
    const [newComment] = await trx(EtableNames.product_comments)
      .insert({ ...comment, product_id: productId, user_id: userId })
      .returning("id_product_comment");

    if (!newComment) {
      throw new DatabaseError("errors:db_error_adding", {
        resource: "comment",
      });
    }

    return Number(newComment.id_product_comment);
  } catch (error) {
    console.error(error);
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError("errors:db_error_adding", { resource: "comment" });
  }
};
