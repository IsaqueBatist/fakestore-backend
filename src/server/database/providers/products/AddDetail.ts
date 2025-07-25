import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Detail } from "../../models/Product_detail";
//TODO: Verificar se já existe um detalhe
export const addDetail = async (newDetail: Omit<IProduct_Detail, 'id_product_detail'| 'product_id'>, productId: number): Promise<number | Error> => {
  try {

    const [existDetail] = await Knex(EtableNames.product_details)
    .select()
    .where('product_id',productId)
    .returning('id_product_detail')

    if(existDetail) return new Error('This product alredy has a detail')

    const product = await Knex(EtableNames.products)
      .select('id_product')
      .where('id_product', productId)
      .first();

    if (!product) {
      return new Error(`Product not found`);
    }

    const [result] = await Knex(EtableNames.product_details).insert({...newDetail, product_id: productId}).returning('id_product_detail')

    if(result) return Number(result.id_product_detail)

    return new Error(`Product not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while add detail to product`);
  }
}