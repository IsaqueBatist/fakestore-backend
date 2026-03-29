import { DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct } from "../../models";

export const updateById = async (
  productId: number,
  newProduct: Omit<IProduct, "id_product">,
): Promise<void | Error> => {
  try {
    const updatedRows = await Knex(EtableNames.products)
      .where("id_product", productId)
      .update(newProduct);

    if (updatedRows > 0) return;

    throw new DatabaseError(`Error updating product with id ${productId}.`);
  } catch (error) {
    console.error(error);
    throw new DatabaseError(`Error updating product with id ${productId}.`);
  }
};
