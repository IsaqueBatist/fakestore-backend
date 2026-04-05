import { RedisService } from "../../shared/services/RedisService";

interface ICartRedisItem {
  quantity: number;
  price: number;
}

export interface ICartItemResponse {
  product_id: number;
  quantity: number;
  price: number;
}

export const getByUserId = async (userId: number): Promise<ICartItemResponse[]> => {
  const cartKey = `cart:${userId}`;
  const rawData = await RedisService.hgetall(cartKey);

  return Object.entries(rawData).map(([productId, value]) => {
    const parsed: ICartRedisItem = JSON.parse(value);
    return {
      product_id: Number(productId),
      quantity: parsed.quantity,
      price: parsed.price,
    };
  });
};
