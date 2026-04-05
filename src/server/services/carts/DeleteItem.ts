import { RedisService } from "../../shared/services/RedisService";

export const deleteItem = async (userId: number, productId: number): Promise<void> => {
  const cartKey = `cart:${userId}`;
  await RedisService.hdel(cartKey, String(productId));
};
