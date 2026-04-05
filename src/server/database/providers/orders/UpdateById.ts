import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder } from "../../models/Order";
import { AppError, DatabaseError, NotFoundError } from "../../../errors"; // Seus erros da Fase 1

export const updateByUserId = async (
  orderId: number,
  newOrder: Omit<IOrder, "id_order" | "created_at">,
): Promise<void> => {
  try {
    const updatedRows = await Knex(EtableNames.orders)
      .where("id_order", orderId)
      .update(newOrder);

    if (updatedRows === 0) {
      throw new NotFoundError("errors:not_found", { resource: "Order" });
    }

    return;
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) throw error;

    throw new DatabaseError("errors:db_error_updating", { resource: "order" });
  }
};
