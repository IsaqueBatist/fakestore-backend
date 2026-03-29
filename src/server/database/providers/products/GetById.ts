import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct } from "../../models";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const getById = async (productId: number): Promise<IProduct> => {
  try {
    const result = await Knex(EtableNames.products)
      .select()
      .where("id_product", productId)
      .first();

    if (result) return result;

    throw new NotFoundError(`Product`);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(
      `Database error while getting product with id ${productId}`,
    );
  }
};
