import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const deleteById = async (categoryId: number): Promise<void> => {
  try {
    const result = await Knex(EtableNames.categories)
      .where("id_category", categoryId)
      .del();

    if (result > 0) return;

    throw new NotFoundError("Category not found");
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Error deleting record with id ${categoryId}`);
  }
};
