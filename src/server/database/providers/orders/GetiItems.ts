import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder_Item } from "../../models";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const getItems = async (
  userId: number,
  orderId: number,
): Promise<IOrder_Item[]> => {
  try {
    const result = await Knex(EtableNames.orders)
      .select()
      .where("user_id", userId)
      .andWhere("id_order", orderId)
      .first();

    if (!result) throw new NotFoundError("User order");

    const items = await Knex(EtableNames.order_items)
      .select()
      .where("order_id", result.id_order);

    if (items) return items;

    throw new NotFoundError(`Items`);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Database error while getting order items`);
  }
};
