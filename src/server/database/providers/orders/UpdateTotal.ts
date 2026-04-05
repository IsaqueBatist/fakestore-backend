import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { TransactionError, DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const updateTotal = async (
  orderId: number,
  total: number,
  trx?: KnexType.Transaction,
): Promise<void> => {
  try {
    const conn = trx ?? Knex;

    const updatedTotal = await conn(EtableNames.orders)
      .update({ total })
      .where("id_order", orderId);

    if (!updatedTotal)
      throw new TransactionError("errors:unable_to_recalculate_total");
  } catch (error) {
    console.error(error);
    if (error instanceof TransactionError) throw error;
    throw new DatabaseError("errors:db_error_updating", { resource: "order total" });
  }
};
