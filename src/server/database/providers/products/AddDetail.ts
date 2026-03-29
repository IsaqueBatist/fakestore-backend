import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct_Detail } from "../../models/Product_detail";
import {
  AppError,
  ConflictError,
  NotFoundError,
  DatabaseError,
} from "../../../errors";
//TODO: Verificar se já existe um detalhe
export const addDetail = async (
  newDetail: Omit<IProduct_Detail, "id_product_detail" | "product_id">,
  productId: number,
): Promise<number> => {
  try {
    const [existDetail] = await Knex(EtableNames.product_details)
      .select()
      .where("product_id", productId)
      .returning("id_product_detail");

    if (existDetail) throw new ConflictError("Product detail");

    const product = await Knex(EtableNames.products)
      .select("id_product")
      .where("id_product", productId)
      .first();

    if (!product) {
      throw new NotFoundError(`Product`);
    }

    const [result] = await Knex(EtableNames.product_details)
      .insert({ ...newDetail, product_id: productId })
      .returning("id_product_detail");

    if (result) return Number(result.id_product_detail);

    throw new NotFoundError(`Product`);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Database error while add detail to product`);
  }
};
