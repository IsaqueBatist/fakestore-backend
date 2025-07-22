import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const deleteFavorite = async (userId: number, productId: number): Promise<void | Error> => {
  try {
    const favorite = await Knex(EtableNames.user_favorites)
      .select()
      .where('product_id', productId )
      .andWhere('user_id', userId)
      .first();

    if (!favorite) {
      return new Error(`Favorite not found`);
    }

    const result = await Knex(EtableNames.user_favorites).where('product_id', productId).andWhere('user_id', userId).del()

    if(result !== 0) return

    return new Error(`Error deleting favorite product`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while deleting favorite product`);
  }
}