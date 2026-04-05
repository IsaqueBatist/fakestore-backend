import { EtableNames } from "../../ETableNames";
import { EOrderStatus } from "../../models/OrderStatus";
import { AppError, DatabaseError, NotFoundError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const updateStatus = async (
  orderId: number,
  tenantId: number,
  status: EOrderStatus,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const updatedRows = await trx(EtableNames.orders)
      .where("id_order", orderId)
      .andWhere("tenant_id", tenantId)
      .update({ status });

    if (updatedRows === 0) {
      throw new NotFoundError("errors:not_found", { resource: "Order" });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_updating", { resource: "order" });
  }
};
