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
import { insertUser, insertProduct, resetCounters } from "../../helpers/factories";

describe("Favorites Routes", () => {
  let tenant: TestTenant;
  let userToken: string;
  let userId: number;
  let productId: number;

  beforeAll(async () => {
    await cleanupTables();
    tenant = await seedTestTenant();
    resetCounters();

    const trx = await createTenantTrx(tenant.id_tenant);
    try {
      const user = await insertUser(trx, { email: "favuser@test.com" });
      userId = user.id_user;

      const product = await insertProduct(trx, { name: "Favorite Product" });
      productId = product.id_product;

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

  describe("GET /favorites", () => {
    it("should return empty favorites initially", async () => {
      const response = await request(server)
        .get("/favorites")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(server)
        .get("/favorites")
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(401);
    });
  });

  describe("POST /favorites", () => {
    it("should add product to favorites", async () => {
      const response = await request(server)
        .post("/favorites")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ product_id: productId });

      expect(response.status).toBe(201);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(server)
        .post("/favorites")
        .set("x-api-key", TEST_API_KEY_1)
        .send({ product_id: productId });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /favorites/:id", () => {
    it("should remove product from favorites", async () => {
      const response = await request(server)
        .delete(`/favorites/${productId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(204);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(server)
        .delete(`/favorites/${productId}`)
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(401);
    });
  });
});
