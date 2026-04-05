import { OrderProvider } from "../../database/providers/orders";
import { IOrder_Item } from "../../database/models";
import type { Knex } from "knex";

export const updateItem = async (
  trx: Knex.Transaction,
  newProduct: Omit<IOrder_Item, "id_order_item" | "order_id" | "tenant_id">,
  userId: number,
  orderId: number,
): Promise<void> => {
  const order = await OrderProvider.getById(orderId, userId, trx);

  await OrderProvider.updateItem(newProduct, order.id_order, trx);

  const updatedItems = await OrderProvider.getOrderItems(order.id_order, trx);

  const newTotal = updatedItems.reduce(
    (acc, item) => acc + item.quantity * item.unt_price,
    0,
  );

  await OrderProvider.updateTotal(order.id_order, newTotal, trx);
};
