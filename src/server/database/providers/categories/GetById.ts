import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICategory } from "../../models";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const getById = async (categortId: number): Promise<ICategory> => {
  try {
    const result = await Knex(EtableNames.categories)
      .select()
      .where("id_category", categortId)
      .first();

    if (result) return result;

    throw new NotFoundError(`Category not found`);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(
      `Database error while getting category with id ${categortId}`,
    );
  }
};
