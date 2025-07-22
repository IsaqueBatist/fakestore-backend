import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct } from "../../models";

export const getById = async (productId: number): Promise<IProduct | Error> => {
  try {
    const result = await Knex(EtableNames.products).select().where('id_product', productId).first()

    if(result) return result

    return new Error(`Product not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while getting product with id ${productId}`);
  }
}