import { Knex } from "../../database/knex";
import { OrderProvider } from "../../database/providers/orders";
import { ProductProvider } from "../../database/providers/products";
import { NotFoundError } from "../../errors";
import { IOrder_Item } from "../../database/models";
import { getItems as getCartItems } from "../carts/GetItems";
import { cleanCart } from "../carts/CleanCart";

export const create = async (userId: number): Promise<number> => {
  const cartItems = await getCartItems(userId);

  if (cartItems.length === 0) {
    throw new NotFoundError("errors:items_not_found", { resource: "Cart" });
  }

  const orderId = await Knex.transaction(async (trx) => {
    const newOrderId = await OrderProvider.create(userId, trx);

    const productIds = cartItems.map((item) => item.product_id);
    const products = await ProductProvider.getByIds(productIds, trx);

    if (products.length !== cartItems.length) {
      throw new NotFoundError("errors:some_products_not_found");
    }

    const priceMap = new Map(products.map((p) => [p.id_product, p.price]));

    const orderItems: Omit<IOrder_Item, "id_order_item">[] = cartItems.map(
      (cartItem) => ({
        order_id: newOrderId,
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        unt_price: priceMap.get(cartItem.product_id) ?? 0,
      }),
    );

    await OrderProvider.addItems(orderItems, trx);

    const total = orderItems.reduce(
      (acc, item) => acc + item.quantity * item.unt_price,
      0,
    );

    await OrderProvider.updateTotal(newOrderId, total, trx);

    return newOrderId;
  });

  await cleanCart(userId);

  return orderId;
};
