import { RedisService } from "../../shared/services/RedisService";
import { NotFoundError } from "../../errors";
import { CACHE_TTL } from "../../shared/constants";

interface ICartRedisItem {
  quantity: number;
  price: number;
}

export const updateItem = async (
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

  const parsed: ICartRedisItem = JSON.parse(existing);
  parsed.quantity = newProduct.quantity;

  await RedisService.hset(cartKey, field, JSON.stringify(parsed));
  await RedisService.expire(cartKey, CACHE_TTL.ONE_WEEK);
};
