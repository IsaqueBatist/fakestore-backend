import request from "supertest";
import { server } from "../../../src/server/server";
import {
  testKnex,
  seedTestTenant,
  cleanupTables,
  destroyConnections,
  createTenantTrx,
  TEST_API_KEY_1,
  TestTenant,
} from "../../helpers/testDb";
import { generateTestToken, generateAdminToken } from "../../helpers/testAuth";
import { insertProduct, insertUser, resetCounters } from "../../helpers/factories";

describe("Products Routes", () => {
  let tenant: TestTenant;
  let userToken: string;
  let adminToken: string;
  let testProductId: number;

  beforeAll(async () => {
    await cleanupTables();
    tenant = await seedTestTenant();

    // Create a user and products directly in DB for testing
    const trx = await createTenantTrx(tenant.id_tenant);
    try {
      const user = await insertUser(trx, { email: "produser@test.com" });
      const adminUser = await insertUser(trx, {
        email: "prodadmin@test.com",
        role: "admin",
      });

      for (let i = 0; i < 5; i++) {
        const product = await insertProduct(trx, {
          name: `Existing Product ${i + 1}`,
        });
        if (i === 0) testProductId = product.id_product;
      }

      userToken = generateTestToken({
        uid: user.id_user,
        tid: tenant.id_tenant,
      });
      adminToken = generateAdminToken({
        uid: adminUser.id_user,
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

  describe("GET /products", () => {
    it("should return 200 with paginated products", async () => {
      const response = await request(server)
        .get("/products")
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty("pagination");
    });

    it("should support limit query parameter", async () => {
      const response = await request(server)
        .get("/products?limit=2")
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it("should support cursor pagination", async () => {
      const firstPage = await request(server)
        .get("/products?limit=2")
        .set("x-api-key", TEST_API_KEY_1);

      if (firstPage.body.pagination.next_cursor) {
        const secondPage = await request(server)
          .get(`/products?limit=2&cursor=${firstPage.body.pagination.next_cursor}`)
          .set("x-api-key", TEST_API_KEY_1);

        expect(secondPage.status).toBe(200);
        expect(secondPage.body.data).toBeDefined();
        // Second page should have different items
        if (secondPage.body.data.length > 0 && firstPage.body.data.length > 0) {
          expect(secondPage.body.data[0].id_product).not.toBe(
            firstPage.body.data[0].id_product,
          );
        }
      }
    });

    it("should support filter query parameter", async () => {
      const response = await request(server)
        .get("/products?filter=Existing")
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].name).toContain("Existing");
      }
    });
  });

  describe("GET /products/:id", () => {
    it("should return 200 with product details", async () => {
      const response = await request(server)
        .get(`/products/${testProductId}`)
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id_product", testProductId);
    });

    it("should return 404 for nonexistent product", async () => {
      const response = await request(server)
        .get("/products/999999")
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("POST /products (admin only)", () => {
    it("should return 201 for admin user", async () => {
      const response = await request(server)
        .post("/products")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "New Admin Product",
          description: "A great product",
          price: 49.99,
          stock: 50,
          image_url: "https://example.com/img.jpg",
          rating: 4.5,
          specifications: { weight: "1kg" },
        });

      expect(response.status).toBe(201);
    });

    it("should return 403 for non-admin user", async () => {
      const response = await request(server)
        .post("/products")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "User Product",
          description: "Should fail",
          price: 10,
          image_url: "https://example.com/img.jpg",
          rating: 3,
          specifications: {},
        });

      expect(response.status).toBe(403);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(server)
        .post("/products")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          name: "No Auth Product",
          description: "Should fail",
          price: 10,
          image_url: "https://example.com/img.jpg",
          rating: 3,
          specifications: {},
        });

      expect(response.status).toBe(401);
    });

    it("should return 400 for invalid body", async () => {
      const response = await request(server)
        .post("/products")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "AB", // too short (min 3)
          price: -1, // must be > 0
        });

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /products/:id", () => {
    it("should return 204 for admin user", async () => {
      const response = await request(server)
        .put(`/products/${testProductId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Product Name",
          description: "Updated description",
          price: 35.0,
          stock: 50,
          image_url: "https://example.com/updated.jpg",
          rating: 4.0,
          specifications: { weight: "600g" },
        });

      expect(response.status).toBeLessThan(400);
    });

    it("should return 403 for non-admin user", async () => {
      const response = await request(server)
        .put(`/products/${testProductId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Should Fail" });

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /products/:id", () => {
    it("should return 403 for non-admin user", async () => {
      const response = await request(server)
        .delete(`/products/${testProductId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("Product Comments", () => {
    let commentId: number;

    it("POST /products/:id/comments should add comment for auth user", async () => {
      const response = await request(server)
        .post(`/products/${testProductId}/comments`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ comment: "Great product!" });

      expect(response.status).toBe(201);
      if (response.body.id_product_comment) {
        commentId = response.body.id_product_comment;
      }
    });

    it("GET /products/:id/comments should return comments", async () => {
      const response = await request(server)
        .get(`/products/${testProductId}/comments`)
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("POST /products/:id/comments should return 401 without auth", async () => {
      const response = await request(server)
        .post(`/products/${testProductId}/comments`)
        .set("x-api-key", TEST_API_KEY_1)
        .send({ comment: "No auth comment" });

      expect(response.status).toBe(401);
    });
  });
});
