import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICategory } from "../../models";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const updateById = async (
  categoryId: number,
  newCategory: Omit<ICategory, "id_category">,
): Promise<void> => {
  try {
    const updatedRows = await Knex(EtableNames.categories)
      .where("id_category", categoryId)
      .update(newCategory);

    if (updatedRows > 0) return;

    throw new NotFoundError("errors:not_found", { resource: "Category" });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_updating", { resource: "category" });
  }
};
