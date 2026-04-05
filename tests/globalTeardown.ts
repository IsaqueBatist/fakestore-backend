import { Knex } from "../src/server/database/knex";
import { RedisService } from "../src/server/shared/services/RedisService";

export default async function globalTeardown() {
  try {
    await RedisService.flushall();
    await RedisService.disconnect();
  } catch {
    // Redis may already be disconnected
  }
  try {
    await Knex.destroy();
  } catch {
    // Knex may already be destroyed
  }
}
