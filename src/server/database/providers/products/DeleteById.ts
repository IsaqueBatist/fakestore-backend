import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const deleteById = async (productId: number): Promise<void> => {
  try {
    const result = await Knex(EtableNames.products)
      .where("id_product", productId)
      .del();

    if (result > 0) return;

    throw new NotFoundError(`Product not found`);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Error deleting record with id ${productId}`);
  }
};
