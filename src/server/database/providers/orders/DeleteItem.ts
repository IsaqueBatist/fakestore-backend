import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  DatabaseError,
} from "../../../errors";

export const deleteItem = async (
  userId: number,
  productId: number,
  orderId: number,
): Promise<void> => {
  try {
    const order = await Knex(EtableNames.orders)
      .select()
      .where("user_id", userId)
      .andWhere("id_order", orderId)
      .first();

    if (!order) {
      throw new NotFoundError("errors:not_found", { resource: "Order" });
    }

    if (Number(order.user_id) !== userId)
      throw new ForbiddenError("errors:forbidden_action", { action: "delete", resource: "order item" });

    const deletedRows = await Knex(EtableNames.order_items)
      .where("order_id", order.id_order)
      .andWhere("product_id", productId)
      .delete();

    if (deletedRows === 0) {
      throw new NotFoundError("errors:not_found", { resource: "Order item" });
    }

    return;
  } catch (error) {
    console.error("Error deleting order item:", error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_deleting_item", { resource: "order" });
  }
};
