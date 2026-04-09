import { RedisService } from "../../shared/services/RedisService";
import { ProductProvider } from "../../database/providers/products";
import { BadRequestError, NotFoundError } from "../../errors";
import { CACHE_TTL } from "../../shared/constants";
import type { Knex } from "knex";

interface ICartRedisItem {
  quantity: number;
  price: number;
}

export const updateItem = async (
  trx: Knex.Transaction,
  newProduct: { quantity: number },
  userId: number,
  productId: number,
): Promise<void> => {
  const cartKey = `cart:${userId}`;
  const field = String(productId);

  const existing = await RedisService.hget(cartKey, field);

  if (!existing) {
    throw new NotFoundError("errors:not_found", { resource: "Cart item" });
  }

  // Soft stock check (authoritative check happens at order creation with FOR UPDATE)
  const product = await ProductProvider.getById(productId, trx);
  if (newProduct.quantity > product.stock) {
    throw new BadRequestError("errors:stock_exceeded_cart", {
      product: product.name,
      requested: String(newProduct.quantity),
      available: String(product.stock),
    });
  }

  const parsed: ICartRedisItem = JSON.parse(existing);
  parsed.quantity = newProduct.quantity;

  await RedisService.hset(cartKey, field, JSON.stringify(parsed));
  await RedisService.expire(cartKey, CACHE_TTL.ONE_WEEK);
};
