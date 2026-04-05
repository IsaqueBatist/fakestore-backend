import { RedisService } from "../../shared/services/RedisService";
import { NotFoundError } from "../../errors";

interface ICartRedisItem {
  quantity: number;
  price: number;
}

export interface ICartItemResponse {
  product_id: number;
  quantity: number;
  price: number;
}

export const getItems = async (userId: number): Promise<ICartItemResponse[]> => {
  const cartKey = `cart:${userId}`;
  const rawData = await RedisService.hgetall(cartKey);

  const entries = Object.entries(rawData);

  if (entries.length === 0) {
    throw new NotFoundError("errors:items_not_found", { resource: "Cart" });
  }

  return entries.map(([productId, value]) => {
    const parsed: ICartRedisItem = JSON.parse(value);
    return {
      product_id: Number(productId),
      quantity: parsed.quantity,
      price: parsed.price,
    };
  });
};
