import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const deleteComment = async (commentId: number, productId: number, userId: number): Promise<void | Error> => {
  try {
    const comment = await Knex(EtableNames.product_comments)
    .select()
    .where('id_product_comment', commentId)
    .first()

    if(!comment){
      return new Error('Comment not found')
    }

    if(comment.user_id !== userId){
      return new Error('You cant delete this comment')
    }

    const result = await Knex(EtableNames.product_comments).where('product_id', productId).andWhere('id_product_comment', commentId).del()

    if(result !== 0) return

    return new Error(`Error deleting category of product`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while add detail to product`);
  }
}