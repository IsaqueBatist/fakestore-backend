import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const deleteDetail = async (productId: number): Promise<void | Error> => {
  try {
    const product = await Knex(EtableNames.products)
      .select('id_product')
      .where('id_product', productId)
      .first();

    if (!product) {
      return new Error(`Product not found`);
    }

    const result = await Knex(EtableNames.product_details).where('product_id', productId).del()

    if(result !== 0) return

    return new Error(`Product not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while add detail to product`);
  }
}