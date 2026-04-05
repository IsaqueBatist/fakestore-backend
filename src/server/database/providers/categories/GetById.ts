import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICategory } from "../../models";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const getById = async (categoryId: number): Promise<ICategory> => {
  try {
    const result = await Knex(EtableNames.categories)
      .select()
      .where("id_category", categoryId)
      .first();

    if (result) return result;

    throw new NotFoundError("errors:not_found", { resource: "Category" });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_getting", { resource: "category" });
  }
};
