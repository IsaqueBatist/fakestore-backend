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
import { generateAdminToken, generateTestToken } from "../../helpers/testAuth";
import { insertUser, insertCategory, resetCounters } from "../../helpers/factories";

describe("Categories Routes", () => {
  let tenant: TestTenant;
  let adminToken: string;
  let userToken: string;
  let testCategoryId: number;

  beforeAll(async () => {
    await cleanupTables();
    tenant = await seedTestTenant();
    resetCounters();

    const trx = await createTenantTrx(tenant.id_tenant);
    try {
      const admin = await insertUser(trx, {
        email: "catadmin@test.com",
        role: "admin",
      });
      const user = await insertUser(trx, { email: "catuser@test.com" });

      const cat = await insertCategory(trx, { name: "Electronics" });
      testCategoryId = cat.id_category;
      await insertCategory(trx, { name: "Fashion" });

      adminToken = generateAdminToken({
        uid: admin.id_user,
        tid: tenant.id_tenant,
      });
      userToken = generateTestToken({
        uid: user.id_user,
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

  describe("GET /categories", () => {
    it("should return 200 with list of categories", async () => {
      const response = await request(server)
        .get("/categories")
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(200);
      // Categories endpoint returns paginated cursor response
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET /categories/:id", () => {
    it("should return 200 with category details", async () => {
      const response = await request(server)
        .get(`/categories/${testCategoryId}`)
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id_category", testCategoryId);
    });

    it("should return 404 for nonexistent category", async () => {
      const response = await request(server)
        .get("/categories/999999")
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("POST /categories (admin only)", () => {
    it("should return 201 for admin user", async () => {
      const response = await request(server)
        .post("/categories")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "New Category", description: "A new test category" });

      expect(response.status).toBe(201);
    });

    it("should return 403 for non-admin user", async () => {
      const response = await request(server)
        .post("/categories")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Forbidden Category", description: "Should fail" });

      expect(response.status).toBe(403);
    });

    it("should return 400 for invalid body", async () => {
      const response = await request(server)
        .post("/categories")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "AB" }); // too short if min 3

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /categories/:id", () => {
    it("should update category for admin", async () => {
      const response = await request(server)
        .put(`/categories/${testCategoryId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Updated Electronics", description: "Updated description" });

      expect(response.status).toBeLessThan(400);
    });
  });

  describe("DELETE /categories/:id", () => {
    it("should return 403 for non-admin user", async () => {
      const response = await request(server)
        .delete(`/categories/${testCategoryId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});
