import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const addCategory = async (productId: number, categoryId: number): Promise<number | Error> => {
  try {
    const product = await Knex(EtableNames.products)
      .select('id_product')
      .where('id_product', productId)
      .first();

    if (!product) {
      return new Error(`Product not found`);
    }
    
    const category = await Knex(EtableNames.categories)
      .select('id_category')
      .where('id_category', categoryId)
      .first();

    if (!category) {
      return new Error(`Category not found`);
    }

    const [result] = await Knex(EtableNames.product_categories).insert({ product_id: productId, category_id: categoryId}).returning('product_id')

    if(result) return Number(result.product_id)

    return new Error(`Error adding category to product`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while add detail to product`);
  }
}