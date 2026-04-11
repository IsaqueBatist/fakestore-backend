import request from "supertest";
import { server } from "../../../src/server/server";
import {
  seedTestTenant,
  cleanupTables,
  destroyConnections,
  TEST_API_KEY_1,
  TestTenant,
} from "../../helpers/testDb";
import { resetCounters } from "../../helpers/factories";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// RedisService is already mocked globally in jest.setup.ts

describe("Shipping Routes", () => {
  let tenant: TestTenant;
  const validQuoteBody = {
    from_postal_code: "01310100",
    to_postal_code: "22041080",
    weight: 1.5,
    height: 10,
    width: 15,
    length: 20,
    insurance_value_cents: 4990,
  };

  beforeAll(async () => {
    await cleanupTables();
    tenant = await seedTestTenant();
    resetCounters();
    process.env.MELHOR_ENVIO_TOKEN = "test-token";
  });

  afterAll(async () => {
    delete process.env.MELHOR_ENVIO_TOKEN;
    await cleanupTables();
    await destroyConnections();
  });

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("POST /v1/shipping/quote", () => {
    it("should return 200 with shipping quotes for valid CEPs", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: "SEDEX",
            company: { name: "Correios" },
            price: "24.90",
            delivery_time: 3,
          },
          {
            name: "PAC",
            company: { name: "Correios" },
            price: "15.50",
            delivery_time: 7,
          },
        ],
      });

      const response = await request(server)
        .post("/v1/shipping/quote")
        .set("x-api-key", TEST_API_KEY_1)
        .send(validQuoteBody);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toEqual({
        carrier: "Correios",
        service: "SEDEX",
        price_cents: 2490,
        delivery_days: 3,
      });
      expect(response.body.data[1]).toEqual({
        carrier: "Correios",
        service: "PAC",
        price_cents: 1550,
        delivery_days: 7,
      });
    });

    it("should return 400 for invalid CEP format (not 8 digits)", async () => {
      const response = await request(server)
        .post("/v1/shipping/quote")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          ...validQuoteBody,
          from_postal_code: "1234",
        });

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(server)
        .post("/v1/shipping/quote")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          from_postal_code: "01310100",
        });

      expect(response.status).toBe(400);
    });

    it("should return 400 when MELHOR_ENVIO_TOKEN not set (shipping not configured)", async () => {
      const originalToken = process.env.MELHOR_ENVIO_TOKEN;
      delete process.env.MELHOR_ENVIO_TOKEN;

      try {
        const response = await request(server)
          .post("/v1/shipping/quote")
          .set("x-api-key", TEST_API_KEY_1)
          .send(validQuoteBody);

        expect(response.status).toBe(400);
      } finally {
        process.env.MELHOR_ENVIO_TOKEN = originalToken;
      }
    });
  });

  describe("GET /v1/shipping/tracking/:code", () => {
    it("should return 200 with tracking info", async () => {
      const trackingCode = "BR123456789BR";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          [trackingCode]: {
            status: "delivered",
            tracking: [
              {
                date: "2026-04-10T14:30:00",
                description: "Objeto entregue ao destinatario",
                locale: "SAO PAULO - SP",
              },
              {
                date: "2026-04-09T08:15:00",
                description: "Objeto saiu para entrega ao destinatario",
                locale: "SAO PAULO - SP",
              },
            ],
          },
        }),
      });

      const response = await request(server)
        .get(`/v1/shipping/tracking/${trackingCode}`)
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        code: trackingCode,
        status: "delivered",
        events: [
          {
            date: "2026-04-10T14:30:00",
            description: "Objeto entregue ao destinatario",
            location: "SAO PAULO - SP",
          },
          {
            date: "2026-04-09T08:15:00",
            description: "Objeto saiu para entrega ao destinatario",
            location: "SAO PAULO - SP",
          },
        ],
      });
    });

    it("should return 400 for tracking not found", async () => {
      const trackingCode = "INVALID123";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const response = await request(server)
        .get(`/v1/shipping/tracking/${trackingCode}`)
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(400);
    });
  });
});
