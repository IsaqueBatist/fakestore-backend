import { DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Category } from "../../models/Product_category";
import type { Knex as KnexType } from "knex";

export const getAllCategories = async (
  productId: number,
  trx?: KnexType.Transaction,
): Promise<IProduct_Category[] | Error> => {
  try {
    const conn = trx ?? Knex;
    const result = await conn(EtableNames.product_categories)
      .select()
      .where("product_id", productId);

    return result;
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_getting_all", { resource: "product categories" });
  }
};
