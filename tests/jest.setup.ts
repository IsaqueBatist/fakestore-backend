import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-jest-tests";
process.env.REDIS_HOST = "127.0.0.1";
process.env.REDIS_PORT = "6379";

// Mock RedisService globally before any module imports it
jest.mock("../src/server/shared/services/RedisService", () => {
  const store = new Map<string, string>();
  const hashStore = new Map<string, Map<string, string>>();

  return {
    RedisService: {
      get: jest.fn(async (key: string) => {
        const val = store.get(key);
        return val ? JSON.parse(val) : null;
      }),
      set: jest.fn(async (key: string, value: unknown) => {
        store.set(key, JSON.stringify(value));
      }),
      invalidate: jest.fn(async () => {}),
      invalidatePattern: jest.fn(async () => {}),
      hset: jest.fn(
        async (key: string, field: string, value: string | number) => {
          if (!hashStore.has(key)) hashStore.set(key, new Map());
          hashStore.get(key)!.set(field, String(value));
        },
      ),
      hget: jest.fn(async (key: string, field: string) => {
        return hashStore.get(key)?.get(field) ?? null;
      }),
      hgetall: jest.fn(async (key: string) => {
        const map = hashStore.get(key);
        if (!map) return {};
        return Object.fromEntries(map.entries());
      }),
      hdel: jest.fn(async (key: string, field: string) => {
        hashStore.get(key)?.delete(field);
      }),
      expire: jest.fn(async () => {}),
      lpush: jest.fn(async () => {}),
      llen: jest.fn(async () => 0),
      lrange: jest.fn(async () => []),
      ltrim: jest.fn(async () => {}),
      incr: jest.fn(async () => 1),
      rateLimitCheck: jest.fn(async () => 1),
      flushall: jest.fn(async () => {}),
      disconnect: jest.fn(async () => {}),
    },
  };
});

// Mock EmailService globally
jest.mock("../src/server/shared/services/EmailService", () => ({
  sendForgotPasswordEmail: jest.fn(async () => {}),
}));

// Mock WebhookService globally
jest.mock("../src/server/shared/services/WebhookService", () => ({
  dispatchWebhook: jest.fn(async () => {}),
  generateWebhookSignature: jest.fn((payload: string, secret: string) => {
    const crypto = require("crypto");
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }),
}));
