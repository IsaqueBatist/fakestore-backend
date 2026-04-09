import { EtableNames } from "../../ETableNames";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const create = async (
  userId: number,
  trx: KnexType.Transaction,
): Promise<number> => {
  try {
    const [newOrder] = await trx(EtableNames.orders)
      .insert({ total: 0, user_id: userId })
      .returning("id_order");

    return newOrder.id_order;
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_creating", { resource: "order" });
  }
};
