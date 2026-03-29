import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import {
  AppError,
  NotFoundError,
  DatabaseError,
} from "../../../errors";

export const addCategory = async (
  productId: number,
  categoryId: number,
): Promise<number> => {
  try {
    const product = await Knex(EtableNames.products)
      .select("id_product")
      .where("id_product", productId)
      .first();

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const category = await Knex(EtableNames.categories)
      .select("id_category")
      .where("id_category", categoryId)
      .first();

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const [result] = await Knex(EtableNames.product_categories)
      .insert({ product_id: productId, category_id: categoryId })
      .returning("product_id");

    if (result) return Number(result.product_id);

    throw new DatabaseError("Error adding category to product");
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("Database error while adding category to product");
  }
};
