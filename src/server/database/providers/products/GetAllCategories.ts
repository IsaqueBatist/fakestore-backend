import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Category } from "../../models/Product_category";

export const getAllCategories = async (productId: number): Promise<IProduct_Category[] | Error> => {
    try {
      const result = await Knex(EtableNames.product_categories)
      .select()
      .where('product_id', productId)
      
      return result
  } catch (error) {
    console.error(error)
    return new Error('Error getting all categories of product');
  }
}