import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const deleteCategory = async (categoryId: number, productId: number): Promise<void | Error> => {
  try {
    const category = await Knex(EtableNames.product_categories)
      .select('category_id')
      .where('category_id', categoryId)
      .andWhere('product_id', productId)
      .first();

    if (!category) {
      return new Error(`Category not found`);
    }

    const result = await Knex(EtableNames.product_categories).where('product_id', productId).andWhere('category_id', categoryId).del()

    if(result !== 0) return

    return new Error(`Error deleting category of product`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while add detail to product`);
  }
}