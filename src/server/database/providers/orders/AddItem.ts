import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder_Item } from "../../models/Order_item";

export const addItem = async (
  newProduct: Omit<IOrder_Item, "id_order_item" | "order_id">,
  userId: number,
  orderId: number,
): Promise<void | Error> => {
  try {
    return await Knex.transaction(async (trx) => {
      const order = await trx(EtableNames.orders)
        .select()
        .where("user_id", userId)
        .andWhere("id_order", orderId)
        .first()
        .forUpdate();

      if (!order) {
        throw new Error(`Order not found for user`);
      }

      const product = await trx(EtableNames.products)
        .select()
        .where("id_product", newProduct.product_id)
        .first();

      if (!product) throw new Error("Non-existent Product");

      const existItem = await trx(EtableNames.order_items)
        .where({
          order_id: order.id_order,
          product_id: newProduct.product_id,
        })
        .first();

      if (existItem) {
        const [updateExistItem] = await trx(EtableNames.order_items)
          .update({ quantity: existItem.quantity + 1 })
          .where("order_id", order.id_order)
          .andWhere("product_id", existItem.product_id)
          .returning("id_order_item");

        if (!updateExistItem)
          throw new Error("Unable to increase item quantity");
      } else {
        const [result] = await trx(EtableNames.order_items)
          .insert({ ...newProduct, order_id: order.id_order })
          .returning("id_order_item");

        if (!result) throw new Error("Unable to add item");
      }

      const updatedItems = await trx(EtableNames.order_items)
        .select("quantity", "unt_price")
        .where("order_id", order.id_order);

      const newTotal = updatedItems.reduce(
        (acc, item) => acc + item.quantity * item.unt_price,
        0,
      );

      const updatedTotal = await trx(EtableNames.orders)
        .update({ total: newTotal })
        .where("id_order", order.id_order);

      if (!updatedTotal) throw new Error("Unable to recalculate total");

      return;
    });
  } catch (error) {
    console.error(error);
    return new Error(`Database error while add item to order`);
  }
};
