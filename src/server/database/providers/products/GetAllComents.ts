import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Comment } from "../../models";

export const getAllComments = async (productId: number): Promise<IProduct_Comment[] | Error> => {
    try {
      const result = await Knex(EtableNames.product_comments)
      .select()
      .where('product_id', productId)
      
      return result
  } catch (error) {
    console.error(error)
    return new Error('Error getting all categories of product');
  }
}