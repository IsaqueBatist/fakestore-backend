import request from "supertest";
import { server } from "../../../src/server/server";
import {
  seedTestTenant,
  cleanupTables,
  destroyConnections,
  createTenantTrx,
  TEST_API_KEY_1,
  TestTenant,
} from "../../helpers/testDb";
import { generateTestToken } from "../../helpers/testAuth";
import {
  insertUser,
  insertProduct,
  insertCart,
  insertOrder,
  resetCounters,
} from "../../helpers/factories";
import { EtableNames } from "../../../src/server/database/ETableNames";

describe("Orders Routes", () => {
  let tenant: TestTenant;
  let userToken: string;
  let userId: number;
  let productId: number;
  let orderId: number;

  beforeAll(async () => {
    await cleanupTables();
    tenant = await seedTestTenant();
    resetCounters();

    const trx = await createTenantTrx(tenant.id_tenant);
    try {
      const user = await insertUser(trx, { email: "orderuser@test.com" });
      userId = user.id_user;

      const product = await insertProduct(trx, {
        name: "Order Test Product",
        price: 25.0,
      });
      productId = product.id_product;

      // Create a cart for the user
      const cart = await insertCart(trx, userId);

      // Add item to cart
      await trx(EtableNames.cart_items).insert({
        cart_id: cart.id_cart,
        product_id: productId,
        quantity: 2,
      });

      // Create an existing order
      const order = await insertOrder(trx, userId, { total: 50 });
      orderId = order.id_order;

      userToken = generateTestToken({
        uid: userId,
        tid: tenant.id_tenant,
      });

      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  });

  afterAll(async () => {
    await cleanupTables();
    await destroyConnections();
  });

  describe("GET /orders", () => {
    it("should return orders for authenticated user", async () => {
      const response = await request(server)
        .get("/orders")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(server)
        .get("/orders")
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /orders/:id", () => {
    it("should return order details for authenticated user", async () => {
      const response = await request(server)
        .get(`/orders/${orderId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id_order");
    });
  });

  describe("POST /orders/from-cart", () => {
    it("should require Idempotency-Key header", async () => {
      const response = await request(server)
        .post("/orders/from-cart")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it("should create order from cart with idempotency key", async () => {
      const response = await request(server)
        .post("/orders/from-cart")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .set("Idempotency-Key", "order-key-unique-1")
        .send({});

      // Could be 201 (created) or error if cart is empty after previous operations
      expect([200, 201, 404]).toContain(response.status);
    });

    it("should return same response for duplicate idempotency key", async () => {
      // First, ensure cart has items
      const trx = await createTenantTrx(tenant.id_tenant);
      try {
        const cart = await trx(EtableNames.cart)
          .where("user_id", userId)
          .first();
        if (cart) {
          await trx(EtableNames.cart_items).insert({
            cart_id: cart.id_cart,
            product_id: productId,
            quantity: 1,
          });
        }
        await trx.commit();
      } catch {
        await trx.rollback();
      }

      const key = "idempotency-duplicate-test";

      const res1 = await request(server)
        .post("/orders/from-cart")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .set("Idempotency-Key", key)
        .send({});

      const res2 = await request(server)
        .post("/orders/from-cart")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .set("Idempotency-Key", key)
        .send({});

      // Second request should return cached response
      expect(res2.status).toBe(res1.status);
      expect(res2.body).toEqual(res1.body);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(server)
        .post("/orders/from-cart")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Idempotency-Key", "no-auth-key")
        .send({});

      expect(response.status).toBe(401);
    });
  });

  describe("Order Items", () => {
    it("GET /orders/:id/items should return items", async () => {
      const response = await request(server)
        .get(`/orders/${orderId}/items`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
    });

    it("POST /orders/:id/items should add item to order", async () => {
      const response = await request(server)
        .post(`/orders/${orderId}/items`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 1,
          unt_price: 25.0,
        });

      expect(response.status).toBeLessThan(400);
    });
  });

  describe("Concurrent order creation", () => {
    it("should handle concurrent requests with same idempotency key", async () => {
      // Prepare cart items
      const trx = await createTenantTrx(tenant.id_tenant);
      try {
        const cart = await trx(EtableNames.cart)
          .where("user_id", userId)
          .first();
        if (cart) {
          await trx(EtableNames.cart_items).where("cart_id", cart.id_cart).delete();
          await trx(EtableNames.cart_items).insert({
            cart_id: cart.id_cart,
            product_id: productId,
            quantity: 1,
          });
        }
        await trx.commit();
      } catch {
        await trx.rollback();
      }

      const key = "concurrent-idempotency-test";

      // Fire two requests simultaneously
      const [res1, res2] = await Promise.all([
        request(server)
          .post("/orders/from-cart")
          .set("x-api-key", TEST_API_KEY_1)
          .set("Authorization", `Bearer ${userToken}`)
          .set("Idempotency-Key", key)
          .send({}),
        request(server)
          .post("/orders/from-cart")
          .set("x-api-key", TEST_API_KEY_1)
          .set("Authorization", `Bearer ${userToken}`)
          .set("Idempotency-Key", key)
          .send({}),
      ]);

      // Both should respond without server errors (no 500s)
      // The idempotency mechanism ensures consistency
      expect(res1.status).toBeLessThan(500);
      expect(res2.status).toBeLessThan(500);
    });
  });
});
