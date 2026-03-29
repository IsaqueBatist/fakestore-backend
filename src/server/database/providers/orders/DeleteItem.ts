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
      throw new NotFoundError("Order not found");
    }

    if (Number(order.user_id) !== userId)
      throw new ForbiddenError("You cant delete this item of order");

    const deletedRows = await Knex(EtableNames.order_items)
      .where("order_id", order.id_order)
      .andWhere("product_id", productId)
      .delete();

    if (deletedRows === 0) {
      throw new NotFoundError("Order item not found");
    }

    return;
  } catch (error) {
    console.error("Error deleting order item:", error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("Database error while deleting item from order");
  }
};
