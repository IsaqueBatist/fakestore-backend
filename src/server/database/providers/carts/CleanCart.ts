import { EtableNames } from "../../ETableNames";
import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const cleanCart = async (
  cartId: number,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    await trx(EtableNames.cart_items).delete().where("cart_id", cartId);

    return;
  } catch (error) {
    logger.error({ err: error }, "Failed to clean cart");
    throw new DatabaseError("errors:db_error_cleaning", { resource: "cart" });
  }
};
