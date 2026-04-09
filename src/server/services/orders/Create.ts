import { OrderProvider } from "../../database/providers/orders";
import { ProductProvider } from "../../database/providers/products";
import { BadRequestError, NotFoundError } from "../../errors";
import { IOrder_Item } from "../../database/models";
import { getItems as getCartItems } from "../carts/GetItems";
import { cleanCart } from "../carts/CleanCart";
import type { PendingWebhook } from "../../../@types/express";
import type { Knex } from "knex";

export const create = async (
  trx: Knex.Transaction,
  tenantId: number,
  userId: number,
  pendingWebhooks: PendingWebhook[],
): Promise<number> => {
  const cartItems = await getCartItems(trx, userId);

  if (cartItems.length === 0) {
    throw new NotFoundError("errors:items_not_found", { resource: "Cart" });
  }

  const newOrderId = await OrderProvider.create(userId, trx);

  const productIds = cartItems.map((item) => item.product_id);

  // Acquire row-level locks (FOR UPDATE) to prevent concurrent over-selling
  const products = await ProductProvider.getByIdsForUpdate(productIds, trx);

  if (products.length !== cartItems.length) {
    throw new NotFoundError("errors:some_products_not_found");
  }

  // Validate stock availability for all items
  const stockMap = new Map(
    products.map((p) => [p.id_product, { stock: p.stock, name: p.name }]),
  );

  for (const cartItem of cartItems) {
    const product = stockMap.get(cartItem.product_id);
    if (product && cartItem.quantity > product.stock) {
      throw new BadRequestError("errors:insufficient_stock", {
        product: product.name,
        requested: String(cartItem.quantity),
        available: String(product.stock),
      });
    }
  }

  const priceMap = new Map(products.map((p) => [p.id_product, p.price]));

  const orderItems: Omit<IOrder_Item, "id_order_item" | "tenant_id">[] =
    cartItems.map((cartItem) => ({
      order_id: newOrderId,
      product_id: cartItem.product_id,
      quantity: cartItem.quantity,
      unt_price: priceMap.get(cartItem.product_id) ?? 0,
    }));

  await OrderProvider.addItems(orderItems, trx);

  // Atomically decrement stock (rows already locked by FOR UPDATE)
  await ProductProvider.decrementStock(
    cartItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    })),
    trx,
  );

  const total = orderItems.reduce(
    (acc, item) => acc + item.quantity * item.unt_price,
    0,
  );

  await OrderProvider.updateTotal(newOrderId, total, trx);

  await cleanCart(trx, userId);

  // Queue webhook for post-commit dispatch (prevents ghost events on rollback)
  pendingWebhooks.push({
    tenantId,
    event: "order.created",
    payload: {
      order_id: newOrderId,
      user_id: userId,
      total,
      items_count: orderItems.length,
    },
  });

  return newOrderId;
};
