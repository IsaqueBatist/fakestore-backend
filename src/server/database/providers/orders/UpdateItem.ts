import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder_Item } from "../../models";
import {
  NotFoundError,
  BadRequestError,
  TransactionError,
  DatabaseError,
} from "../../../errors";

export const updateItem = async (
  newProduct: Omit<IOrder_Item, "id_order_item" | "order_id">,
  userId: number,
  orderId: number,
): Promise<void | Error> => {
  try {
    return await Knex.transaction(async (trx) => {
      const userOrder = await trx(EtableNames.orders)
        .select()
        .where("user_id", userId)
        .andWhere("id_order", orderId)
        .first()
        .forUpdate();

      if (!userOrder) {
        throw new NotFoundError(`Order not found for user`);
      }

      const result = await trx(EtableNames.order_items)
        .update({ ...newProduct })
        .where("order_id", userOrder.id_order)
        .andWhere("product_id", newProduct.product_id);

      if (result === 0) {
        throw new BadRequestError(`Order item not found or unchanged`);
      }

      //Recalcular order

      const updatedItems = await trx(EtableNames.order_items)
        .select("quantity", "unt_price")
        .where("order_id", userOrder.id_order);

      const newTotal = updatedItems.reduce(
        (acc, item) => acc + item.quantity * item.unt_price,
        0,
      );

      const updatedTotal = await trx(EtableNames.orders)
        .update({ total: newTotal })
        .where("id_order", userOrder.id_order);

      if (!updatedTotal)
        throw new TransactionError("Unable to recalculate total");

      return;
    });
  } catch (error) {
    console.error(error);
    throw new DatabaseError(`Database error while update order's item`);
  }
};
