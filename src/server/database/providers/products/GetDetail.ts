import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Detail } from "../../models/Product_detail";

export const getDetail = async (productId: number): Promise<IProduct_Detail | Error> => {
  try {
    const result = await Knex(EtableNames.product_details).select().where('product_id', productId).first()

    if(result) return result

    return new Error(`Product detail not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while getting product detail`);
  }
}