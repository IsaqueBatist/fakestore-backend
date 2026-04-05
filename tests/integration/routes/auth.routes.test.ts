import request from "supertest";
import { server } from "../../../src/server/server";
import {
  testKnex,
  seedTestTenant,
  seedSecondTenant,
  cleanupTables,
  destroyConnections,
  TEST_API_KEY_1,
  TEST_API_KEY_2,
  TestTenant,
} from "../../helpers/testDb";
import { generateTestToken } from "../../helpers/testAuth";

describe("Auth Routes", () => {
  let tenant: TestTenant;
  let tenant2: TestTenant;

  beforeAll(async () => {
    await cleanupTables();
    tenant = await seedTestTenant();
    tenant2 = await seedSecondTenant();
  });

  afterAll(async () => {
    await cleanupTables();
    await destroyConnections();
  });

  describe("POST /register", () => {
    it("should create a user and return 201", async () => {
      const response = await request(server)
        .post("/register")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          name: "Test User",
          email: "newuser@test.com",
          password_hash: "password123",
        });

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
    });

    it("should return 400 for invalid email", async () => {
      const response = await request(server)
        .post("/register")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          name: "Test User",
          email: "not-an-email",
          password_hash: "password123",
        });

      expect(response.status).toBe(400);
    });

    it("should return 400 for short password", async () => {
      const response = await request(server)
        .post("/register")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          name: "Test User",
          email: "short@test.com",
          password_hash: "12",
        });

      expect(response.status).toBe(400);
    });

    it("should return 400 for short name", async () => {
      const response = await request(server)
        .post("/register")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          name: "AB",
          email: "shortname@test.com",
          password_hash: "password123",
        });

      expect(response.status).toBe(400);
    });

    it("should return error for duplicate email within same tenant", async () => {
      const response = await request(server)
        .post("/register")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          name: "Duplicate User",
          email: "newuser@test.com", // same as first test
          password_hash: "password123",
        });

      // Should be 400 (BadRequestError) or similar
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(server)
        .post("/register")
        .set("x-api-key", TEST_API_KEY_1)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe("POST /login", () => {
    it("should return 200 with accessToken for valid credentials", async () => {
      const response = await request(server)
        .post("/login")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          email: "newuser@test.com",
          password_hash: "password123",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(typeof response.body.accessToken).toBe("string");
    });

    it("should return 401 for wrong password", async () => {
      const response = await request(server)
        .post("/login")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          email: "newuser@test.com",
          password_hash: "wrongpassword",
        });

      expect(response.status).toBe(401);
    });

    it("should return error for nonexistent email", async () => {
      const response = await request(server)
        .post("/login")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          email: "nonexistent@test.com",
          password_hash: "password123",
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should return 400 for missing fields", async () => {
      const response = await request(server)
        .post("/login")
        .set("x-api-key", TEST_API_KEY_1)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe("Authentication requirements", () => {
    it("should require x-api-key for /register", async () => {
      const response = await request(server).post("/register").send({
        name: "Test User",
        email: "nokey@test.com",
        password_hash: "password123",
      });

      expect(response.status).toBe(401);
    });

    it("should require x-api-key for /login", async () => {
      const response = await request(server).post("/login").send({
        email: "test@test.com",
        password_hash: "password123",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Cross-tenant token validation", () => {
    it("should reject JWT from Tenant A when used with Tenant B API key", async () => {
      // Register a user on Tenant 2
      await request(server)
        .post("/register")
        .set("x-api-key", TEST_API_KEY_2)
        .send({
          name: "Tenant 2 User",
          email: "tenant2user@test.com",
          password_hash: "password123",
        });

      // Get a token from Tenant 1 login
      const loginRes = await request(server)
        .post("/login")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          email: "newuser@test.com",
          password_hash: "password123",
        });

      const tenant1Token = loginRes.body.accessToken;

      // Use Tenant 1's token with Tenant 2's API key on a protected route
      const response = await request(server)
        .get("/favorites")
        .set("x-api-key", TEST_API_KEY_2)
        .set("Authorization", `Bearer ${tenant1Token}`);

      expect(response.status).toBe(401);
    });
  });
});
