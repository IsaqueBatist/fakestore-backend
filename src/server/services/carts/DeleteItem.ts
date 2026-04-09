import { RedisService } from "../../shared/services/RedisService";
import type { Knex } from "knex";

export const deleteItem = async (
  trx: Knex.Transaction,
  userId: number,
  productId: number,
): Promise<void> => {
  const cartKey = `cart:${userId}`;
  await RedisService.hdel(cartKey, String(productId));
};
