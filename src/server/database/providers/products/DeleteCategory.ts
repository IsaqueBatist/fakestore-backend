import { EtableNames } from "../../ETableNames";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const deleteCategory = async (
  categoryId: number,
  productId: number,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const category = await trx(EtableNames.product_categories)
      .select("category_id")
      .where("category_id", categoryId)
      .andWhere("product_id", productId)
      .first();

    if (!category) {
      throw new NotFoundError("errors:not_found", { resource: "Category" });
    }

    const result = await trx(EtableNames.product_categories)
      .where("product_id", productId)
      .andWhere("category_id", categoryId)
      .del();

    if (result !== 0) return;

    throw new DatabaseError("errors:db_error_deleting", {
      resource: "product category",
    });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_deleting", {
      resource: "product category",
    });
  }
};
