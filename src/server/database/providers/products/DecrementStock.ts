import { EtableNames } from "../../ETableNames";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const decrementStock = async (
  items: Array<{ product_id: number; quantity: number }>,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    for (const item of items) {
      await trx(EtableNames.products)
        .where("id_product", item.product_id)
        .decrement("stock", item.quantity);
    }
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_updating", {
      resource: "product stock",
    });
  }
};
