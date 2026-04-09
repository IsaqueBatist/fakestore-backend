import { EtableNames } from "../../ETableNames";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const addCategory = async (
  productId: number,
  categoryId: number,
  trx: KnexType.Transaction,
): Promise<number> => {
  try {
    const product = await trx(EtableNames.products)
      .select("id_product")
      .where("id_product", productId)
      .first();

    if (!product) {
      throw new NotFoundError("errors:not_found", { resource: "Product" });
    }

    const category = await trx(EtableNames.categories)
      .select("id_category")
      .where("id_category", categoryId)
      .first();

    if (!category) {
      throw new NotFoundError("errors:not_found", { resource: "Category" });
    }

    const [result] = await trx(EtableNames.product_categories)
      .insert({ product_id: productId, category_id: categoryId })
      .returning("product_id");

    if (result) return Number(result.product_id);

    throw new DatabaseError("errors:db_error_adding", {
      resource: "product category",
    });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_adding", {
      resource: "product category",
    });
  }
};
