import { RedisService } from "../../shared/services/RedisService";
import type { Knex } from "knex";

export const cleanCart = async (
  trx: Knex.Transaction,
  userId: number,
): Promise<void> => {
  const cartKey = `cart:${userId}`;
  await RedisService.invalidate(cartKey);
};
