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
  resetCounters,
} from "../../helpers/factories";

describe("Carts Routes", () => {
  let tenant: TestTenant;
  let userToken: string;
  let userId: number;
  let productId: number;
  let product2Id: number;

  beforeAll(async () => {
    await cleanupTables();
    tenant = await seedTestTenant();
    resetCounters();

    const trx = await createTenantTrx(tenant.id_tenant);
    try {
      const user = await insertUser(trx, { email: "cartuser@test.com" });
      userId = user.id_user;

      const product = await insertProduct(trx, {
        name: "Cart Product 1",
        price: 15.0,
      });
      productId = product.id_product;

      const product2 = await insertProduct(trx, {
        name: "Cart Product 2",
        price: 30.0,
      });
      product2Id = product2.id_product;

      // Create cart
      await insertCart(trx, userId);

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

  describe("GET /carts", () => {
    it("should return cart for authenticated user", async () => {
      const response = await request(server)
        .get("/carts")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(server)
        .get("/carts")
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(401);
    });
  });

  describe("Cart Items CRUD", () => {
    let cartItemId: number;

    it("POST /carts/items should add item to cart", async () => {
      const response = await request(server)
        .post("/carts/items")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ product_id: productId, quantity: 2 });

      expect(response.status).toBe(201);
      if (response.body.id_cart_item) {
        cartItemId = response.body.id_cart_item;
      }
    });

    it("POST /carts/items should return 400 for invalid quantity", async () => {
      const response = await request(server)
        .post("/carts/items")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ product_id: productId, quantity: -1 });

      expect(response.status).toBe(400);
    });

    it("POST /carts/items should return 400 for missing product_id", async () => {
      const response = await request(server)
        .post("/carts/items")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 1 });

      expect(response.status).toBe(400);
    });

    it("GET /carts/items should return cart items", async () => {
      const response = await request(server)
        .get("/carts/items")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
    });

    it("PUT /carts/items/:id should update item quantity", async () => {
      if (!cartItemId) return;

      const response = await request(server)
        .put(`/carts/items/${cartItemId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBeLessThan(400);
    });

    it("DELETE /carts/items/:id should remove item from cart", async () => {
      if (!cartItemId) return;

      const response = await request(server)
        .delete(`/carts/items/${cartItemId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBeLessThan(400);
    });
  });

  describe("DELETE /carts", () => {
    it("should clean entire cart", async () => {
      // First add an item
      await request(server)
        .post("/carts/items")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ product_id: product2Id, quantity: 1 });

      const response = await request(server)
        .delete("/carts")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBeLessThan(400);
    });
  });

  describe("Concurrent cart operations", () => {
    it("should handle simultaneous add requests", async () => {
      const [res1, res2] = await Promise.all([
        request(server)
          .post("/carts/items")
          .set("x-api-key", TEST_API_KEY_1)
          .set("Authorization", `Bearer ${userToken}`)
          .send({ product_id: productId, quantity: 1 }),
        request(server)
          .post("/carts/items")
          .set("x-api-key", TEST_API_KEY_1)
          .set("Authorization", `Bearer ${userToken}`)
          .send({ product_id: product2Id, quantity: 1 }),
      ]);

      // Both should succeed or handle gracefully (no 500)
      expect(res1.status).toBeLessThan(500);
      expect(res2.status).toBeLessThan(500);
    });
  });
});
