import { AppError, DatabaseError, NotFoundError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Comment } from "../../models";

export const getAllComments = async (
  productId: number,
): Promise<IProduct_Comment[] | Error> => {
  try {
    const product = await Knex(EtableNames.products)
      .select("id_product")
      .where("id_product", productId)
      .first();

    if (!product) {
      throw new NotFoundError("errors:not_found", { resource: "Product" });
    }

    const result = await Knex(EtableNames.product_comments)
      .select()
      .where("product_id", productId);

    return result;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_getting_all", { resource: "product categories" });
  }
};
