import { Knex } from "../../database/knex";
import { OrderProvider } from "../../database/providers/orders";
import { ProductProvider } from "../../database/providers/products";
import { IOrder_Item } from "../../database/models/Order_item";

export const addItem = async (
  newProduct: Omit<IOrder_Item, "id_order_item" | "order_id" | "unt_price">,
  userId: number,
  orderId: number,
): Promise<void> => {
  return await Knex.transaction(async (trx) => {
    const order = await OrderProvider.getById(orderId, userId, trx);

    const product = await ProductProvider.getById(newProduct.product_id, trx);

    const existItem = await OrderProvider.getItem(order.id_order, newProduct.product_id, trx);

    if (existItem) {
      await OrderProvider.updateItemQuantity(
        order.id_order,
        existItem.product_id,
        existItem.quantity + 1,
        trx,
      );
    } else {
      await OrderProvider.addItem(
        {
          ...newProduct,
          order_id: order.id_order,
          unt_price: product.price,
        },
        trx,
      );
    }

    const updatedItems = await OrderProvider.getOrderItems(order.id_order, trx);

    const newTotal = updatedItems.reduce(
      (acc, item) => acc + item.quantity * item.unt_price,
      0,
    );

    await OrderProvider.updateTotal(order.id_order, newTotal, trx);
  });
};
