import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import {
  AppError,
  NotFoundError,
  DatabaseError,
} from "../../../errors";

export const deleteCategory = async (
  categoryId: number,
  productId: number,
): Promise<void> => {
  try {
    const category = await Knex(EtableNames.product_categories)
      .select("category_id")
      .where("category_id", categoryId)
      .andWhere("product_id", productId)
      .first();

    if (!category) {
      throw new NotFoundError(`Category not found`);
    }

    const result = await Knex(EtableNames.product_categories)
      .where("product_id", productId)
      .andWhere("category_id", categoryId)
      .del();

    if (result !== 0) return;

    throw new DatabaseError("Error deleting category from product");
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("Database error while deleting category from product");
  }
};
