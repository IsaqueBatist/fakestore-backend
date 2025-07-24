import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Comment } from "../../models";

export const UpdateComment = async (newComment: Omit<IProduct_Comment, 'id_product_comment' | 'product_id' | 'user_id'>, userId: number, commentId: number): Promise<void | Error> => {
  try {

    const comment = await Knex(EtableNames.product_comments)
    .select()
    .where('id_product_comment', commentId)
    .first()

    if(!comment) return new Error('Comment not found')

    if(comment.user_id !== userId) return new Error('You cant edit this comment')

    const updatedRows = await Knex(EtableNames.product_comments).where('id_product_comment', commentId).update(newComment)
    
    if(updatedRows > 0) return
    
    return new Error(`Error updating comment`);
  } catch (error) {
    console.error(error)
    return new Error(`Error updating comment`);
  }
}