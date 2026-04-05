import { OrderProvider } from "../../database/providers/orders";
import { ProductProvider } from "../../database/providers/products";
import { NotFoundError } from "../../errors";
import { IOrder_Item } from "../../database/models";
import { getItems as getCartItems } from "../carts/GetItems";
import { cleanCart } from "../carts/CleanCart";
import { dispatchWebhook } from "../../shared/services/WebhookService";
import type { Knex } from "knex";

export const create = async (trx: Knex.Transaction, tenantId: number, userId: number): Promise<number> => {
  const cartItems = await getCartItems(trx, userId);

  if (cartItems.length === 0) {
    throw new NotFoundError("errors:items_not_found", { resource: "Cart" });
  }

  const newOrderId = await OrderProvider.create(userId, trx);

  const productIds = cartItems.map((item) => item.product_id);
  const products = await ProductProvider.getByIds(productIds, trx);

  if (products.length !== cartItems.length) {
    throw new NotFoundError("errors:some_products_not_found");
  }

  const priceMap = new Map(products.map((p) => [p.id_product, p.price]));

  const orderItems: Omit<IOrder_Item, "id_order_item" | "tenant_id">[] = cartItems.map(
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

  await cleanCart(trx, userId);

  // Fire webhook asynchronously (does not block the response)
  dispatchWebhook(tenantId, "order.created", {
    order_id: newOrderId,
    user_id: userId,
    total,
    items_count: orderItems.length,
  }).catch(() => {});

  return newOrderId;
};
