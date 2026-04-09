import { RedisService } from "../../shared/services/RedisService";
import { ProductProvider } from "../../database/providers/products";
import { BadRequestError } from "../../errors";
import { CACHE_TTL } from "../../shared/constants";
import type { Knex } from "knex";

interface ICartRedisItem {
  quantity: number;
  price: number;
}

export const addItem = async (
  trx: Knex.Transaction,
  newProduct: { product_id: number; quantity: number },
  userId: number,
): Promise<ICartRedisItem & { product_id: number }> => {
  const product = await ProductProvider.getById(newProduct.product_id, trx);

  const cartKey = `cart:${userId}`;
  const field = String(newProduct.product_id);

  const existing = await RedisService.hget(cartKey, field);

  let item: ICartRedisItem;

  if (existing) {
    const parsed: ICartRedisItem = JSON.parse(existing);
    const totalQuantity = parsed.quantity + newProduct.quantity;

    // Soft stock check (authoritative check happens at order creation with FOR UPDATE)
    if (totalQuantity > product.stock) {
      throw new BadRequestError("errors:stock_exceeded_cart", {
        product: product.name,
        requested: String(totalQuantity),
        available: String(product.stock),
      });
    }

    item = {
      quantity: totalQuantity,
      price: product.price,
    };
  } else {
    // Soft stock check for new cart item
    if (newProduct.quantity > product.stock) {
      throw new BadRequestError("errors:stock_exceeded_cart", {
        product: product.name,
        requested: String(newProduct.quantity),
        available: String(product.stock),
      });
    }

    item = {
      quantity: newProduct.quantity,
      price: product.price,
    };
  }

  await RedisService.hset(cartKey, field, JSON.stringify(item));
  await RedisService.expire(cartKey, CACHE_TTL.ONE_WEEK);

  return { product_id: newProduct.product_id, ...item };
};
