import crypto from "crypto";

// We need to mock BullMQ and DB before importing the service
const mockQueueAdd = jest.fn();
jest.mock("bullmq", () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: mockQueueAdd,
  })),
}));

jest.mock("../../../src/server/database/knex", () => {
  const mockKnex: any = jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue(null),
  }));
  mockKnex.transaction = jest.fn();
  return { Knex: mockKnex };
});

// Import the real generateWebhookSignature (not mocked in this test)
// We test it directly with crypto
describe("WebhookService", () => {
  describe("generateWebhookSignature", () => {
    it("should produce valid HMAC-SHA256 hex digest", () => {
      const payload = JSON.stringify({ event: "order.created", data: { id: 1 } });
      const secret = "webhook-secret-123";

      const expected = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      // Import the mock version which uses real crypto
      const { generateWebhookSignature } = require("../../../src/server/shared/services/WebhookService");
      const result = generateWebhookSignature(payload, secret);

      expect(result).toBe(expected);
      expect(typeof result).toBe("string");
      expect(result).toHaveLength(64); // SHA-256 hex is 64 chars
    });
  });

  describe("dispatchWebhook", () => {
    it("should be a function", () => {
      const { dispatchWebhook } = require("../../../src/server/shared/services/WebhookService");
      expect(typeof dispatchWebhook).toBe("function");
    });
  });
});
