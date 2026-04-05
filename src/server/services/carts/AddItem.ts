import { RedisService } from "../../shared/services/RedisService";
import { ProductProvider } from "../../database/providers/products";
import { CACHE_TTL } from "../../shared/constants";

interface ICartRedisItem {
  quantity: number;
  price: number;
}

export const addItem = async (
  newProduct: { product_id: number; quantity: number },
  userId: number,
): Promise<ICartRedisItem & { product_id: number }> => {
  const product = await ProductProvider.getById(newProduct.product_id);

  const cartKey = `cart:${userId}`;
  const field = String(newProduct.product_id);

  const existing = await RedisService.hget(cartKey, field);

  let item: ICartRedisItem;

  if (existing) {
    const parsed: ICartRedisItem = JSON.parse(existing);
    item = {
      quantity: parsed.quantity + newProduct.quantity,
      price: product.price,
    };
  } else {
    item = {
      quantity: newProduct.quantity,
      price: product.price,
    };
  }

  await RedisService.hset(cartKey, field, JSON.stringify(item));
  await RedisService.expire(cartKey, CACHE_TTL.ONE_WEEK);

  return { product_id: newProduct.product_id, ...item };
};
