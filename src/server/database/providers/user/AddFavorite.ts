import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const addFavorite = async (productId: number, userId: number): Promise<number | Error> => {
  try {
    const product = await Knex(EtableNames.products)
      .select('id_product')
      .where('id_product', productId)
      .first();

    if (!product) {
      return new Error(`Product not found`);
    }
    
    const user = await Knex(EtableNames.user)
      .select('id_user')
      .where('id_user', userId)
      .first();

    if (!user) {
      return new Error(`User not found`);
    }

    const [result] = await Knex(EtableNames.user_favorites).insert({user_id: userId,  product_id: productId}).returning('product_id')

    if(result) return Number(result.product_id)

    return new Error(`Error adding product to favorites`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while add product to favorites`);
  }
}