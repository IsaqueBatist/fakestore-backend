import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Detail } from "../../models/Product_detail";

export const updateDetail = async (newDetail: Omit<IProduct_Detail, 'id_product_detail'| 'product_id'>, productId: number): Promise<void | Error> => {
  try {
    const product = await Knex(EtableNames.products)
      .select('id_product')
      .where('id_product', productId)
      .first();

    if (!product) {
      return new Error(`Product not found`);
    }

    const rowns = await Knex(EtableNames.product_details).update({...newDetail, product_id: productId})

    if(rowns !== 0) return

    return new Error(`Product not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while editing detail to product`);
  }
}