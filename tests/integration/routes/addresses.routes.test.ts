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
import { insertUser, insertAddress, resetCounters } from "../../helpers/factories";

describe("Addresses Routes", () => {
  let tenant: TestTenant;
  let userToken: string;
  let userId: number;
  let addressId: number;

  beforeAll(async () => {
    await cleanupTables();
    tenant = await seedTestTenant();
    resetCounters();

    const trx = await createTenantTrx(tenant.id_tenant);
    try {
      const user = await insertUser(trx, { email: "addruser@test.com" });
      userId = user.id_user;

      const addr = await insertAddress(trx, userId);
      addressId = addr.id_address;

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

  describe("GET /addresses", () => {
    it("should return addresses for authenticated user", async () => {
      const response = await request(server)
        .get("/addresses")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(server)
        .get("/addresses")
        .set("x-api-key", TEST_API_KEY_1);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /addresses/:id", () => {
    it("should return address by id", async () => {
      const response = await request(server)
        .get(`/addresses/${addressId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id_address");
    });
  });

  describe("POST /addresses", () => {
    it("should create address with valid data", async () => {
      const response = await request(server)
        .post("/addresses")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          street: "Rua Nova 456",
          city: "Rio de Janeiro",
          state: "RJ",
          zip_code: "20000-000",
          country: "Brasil",
        });

      expect(response.status).toBe(201);
    });

    it("should return 400 for invalid zip_code format", async () => {
      const response = await request(server)
        .post("/addresses")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          street: "Rua Test",
          city: "Test City",
          state: "TS",
          zip_code: "invalid",
          country: "Brasil",
        });

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(server)
        .post("/addresses")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ street: "Only street" });

      expect(response.status).toBe(400);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(server)
        .post("/addresses")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          street: "Rua Test",
          city: "Test",
          state: "TS",
          zip_code: "12345-678",
          country: "Brasil",
        });

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /addresses/:id", () => {
    it("should update address", async () => {
      const response = await request(server)
        .put(`/addresses/${addressId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          street: "Rua Atualizada 789",
          city: "Updated City",
          state: "SP",
          zip_code: "01234-567",
          country: "Brasil",
        });

      expect(response.status).toBeLessThan(400);
    });
  });

  describe("DELETE /addresses/:id", () => {
    it("should delete address", async () => {
      // Create a new address to delete
      const createRes = await request(server)
        .post("/addresses")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          street: "To Delete",
          city: "Delete City",
          state: "DC",
          zip_code: "99999-999",
          country: "Brasil",
        });

      if (createRes.status === 201 && createRes.body) {
        const deleteId = createRes.body.id_address || createRes.body;
        const response = await request(server)
          .delete(`/addresses/${deleteId}`)
          .set("x-api-key", TEST_API_KEY_1)
          .set("Authorization", `Bearer ${userToken}`);

        expect(response.status).toBeLessThan(400);
      }
    });
  });
});
