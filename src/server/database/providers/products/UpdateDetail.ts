import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Detail } from "../../models/Product_detail";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const updateDetail = async (
  newDetail: Omit<IProduct_Detail, "id_product_detail" | "product_id">,
  productId: number,
): Promise<void> => {
  try {
    const product = await Knex(EtableNames.products)
      .select("id_product")
      .where("id_product", productId)
      .first();

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const rowns = await Knex(EtableNames.product_details).update({
      ...newDetail,
      product_id: productId,
    });

    if (rowns !== 0) return;

    throw new NotFoundError("Product not found");
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("Database error while updating detail of product");
  }
};
