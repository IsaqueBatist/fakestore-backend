import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const deleteDetail = async (productId: number): Promise<void> => {
  try {
    const product = await Knex(EtableNames.products)
      .select("id_product")
      .where("id_product", productId)
      .first();

    if (!product) {
      throw new NotFoundError(`Product not found`);
    }

    const result = await Knex(EtableNames.product_details)
      .where("product_id", productId)
      .del();

    if (result !== 0) return;

    throw new NotFoundError(`Product not found`);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("Database error while deleting detail from product");
  }
};
