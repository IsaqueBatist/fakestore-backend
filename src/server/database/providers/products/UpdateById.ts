import { DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { IProduct } from "../../models";
import type { Knex as KnexType } from "knex";

export const updateById = async (
  productId: number,
  newProduct: Omit<IProduct, "id_product">,
  trx: KnexType.Transaction,
): Promise<void | Error> => {
  try {
    const productData = {
      ...newProduct,
      specifications: newProduct.specifications
        ? JSON.stringify(newProduct.specifications)
        : null,
    };

    const updatedRows = await trx(EtableNames.products)
      .where("id_product", productId)
      .update(productData as any);

    if (updatedRows > 0) return;

    throw new DatabaseError("errors:db_error_updating", {
      resource: "product",
    });
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_updating", {
      resource: "product",
    });
  }
};
