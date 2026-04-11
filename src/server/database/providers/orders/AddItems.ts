import { EtableNames } from "../../ETableNames";
import { IOrder_Item } from "../../models";
import { TransactionError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const addItems = async (
  orderItems: Omit<IOrder_Item, "id_order_item" | "tenant_id">[],
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const result = await trx(EtableNames.order_items).insert(orderItems);

    if (!result)
      throw new TransactionError("errors:error_adding_items_to_order");
  } catch (error) {
    logger.error({ err: error }, "Failed to add order items");
    if (error instanceof TransactionError) throw error;
    throw new DatabaseError("errors:db_error_adding_item", {
      resource: "order",
    });
  }
};
