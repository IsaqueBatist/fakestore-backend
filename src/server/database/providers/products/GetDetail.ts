import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Detail } from "../../models/Product_detail";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const getDetail = async (
  productId: number,
): Promise<IProduct_Detail> => {
  try {
    const result = await Knex(EtableNames.product_details)
      .select()
      .where("product_id", productId)
      .first();

    if (result) return result;

    throw new NotFoundError("Product detail not found");
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Database error while getting product detail`);
  }
};
