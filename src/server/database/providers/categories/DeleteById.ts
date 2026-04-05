import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const deleteById = async (categoryId: number, trx?: KnexType.Transaction): Promise<void> => {
  try {
    const conn = trx ?? Knex;
    const result = await conn(EtableNames.categories)
      .where("id_category", categoryId)
      .del();

    if (result > 0) return;

    throw new NotFoundError("errors:not_found", { resource: "Category" });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_deleting", { resource: "record" });
  }
};
