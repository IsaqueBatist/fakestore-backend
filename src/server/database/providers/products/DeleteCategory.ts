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
      throw new NotFoundError("errors:not_found", { resource: "Category" });
    }

    const result = await Knex(EtableNames.product_categories)
      .where("product_id", productId)
      .andWhere("category_id", categoryId)
      .del();

    if (result !== 0) return;

    throw new DatabaseError("errors:db_error_deleting", { resource: "product category" });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_deleting", { resource: "product category" });
  }
};
