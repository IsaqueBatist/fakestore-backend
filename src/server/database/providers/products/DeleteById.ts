import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const deleteById = async (productId: number, trx?: KnexType.Transaction): Promise<void> => {
  try {
    const conn = trx ?? Knex;
    const result = await conn(EtableNames.products)
      .where("id_product", productId)
      .del();

    if (result > 0) return;

    throw new NotFoundError("errors:not_found", { resource: "Product" });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_deleting", { resource: "record" });
  }
};
