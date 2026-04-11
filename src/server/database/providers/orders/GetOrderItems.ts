import { EtableNames } from "../../ETableNames";
import { IOrder_Item } from "../../models";
import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const getOrderItems = async (
  orderId: number,
  trx: KnexType.Transaction,
): Promise<Pick<IOrder_Item, "quantity" | "unt_price">[]> => {
  try {
    const items = await trx(EtableNames.order_items)
      .select("quantity", "unt_price")
      .where("order_id", orderId);

    return items;
  } catch (error) {
    logger.error({ err: error }, "Failed to get order items for total");
    throw new DatabaseError("errors:db_error_getting_items", {
      resource: "order",
    });
  }
};
