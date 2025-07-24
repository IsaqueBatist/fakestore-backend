import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Comment } from "../../models";

export const addComment = async (productId: number, comment: Omit<IProduct_Comment, 'id_product_comment' | 'product_id' | 'user_id'>, userId: number): Promise<number | Error> => {
  try {
    const product = await Knex(EtableNames.products)
      .select('id_product')
      .where('id_product', productId)
      .first();

    if (!product) {
      return new Error(`Product not found`);
    }
    
    const [newComment] = await Knex(EtableNames.product_comments).insert({...comment, product_id: productId, user_id: userId}).returning('id_product_comment')

    if (!newComment) {
      return new Error(`Erro inserting new Comment`);
    }

    return newComment.id_product_comment

  } catch (error) {
    console.error(error)
    return new Error(`Database error while add comment to product`);
  }
}