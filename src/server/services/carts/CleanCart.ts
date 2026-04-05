import { RedisService } from "../../shared/services/RedisService";

export const cleanCart = async (userId: number): Promise<void> => {
  const cartKey = `cart:${userId}`;
  await RedisService.invalidate(cartKey);
};
