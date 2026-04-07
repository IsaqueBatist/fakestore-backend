import request from "supertest";
import { server } from "../../../src/server/server";
import { cleanupTables, destroyConnections } from "../../helpers/testDb";
import { RedisService } from "../../../src/server/shared/services/RedisService";

describe("Tenant Routes", () => {
  beforeAll(async () => {
    await cleanupTables();
  });

  afterAll(async () => {
    await cleanupTables();
    await destroyConnections();
  });

  describe("POST /tenants/register", () => {
    it("should create a tenant and return 201 with credentials", async () => {
      const response = await request(server).post("/tenants/register").send({
        name: "My Store",
        slug: "my-store",
        owner_name: "John Doe",
        owner_email: "john@mystore.com",
        owner_password: "SecurePass123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("tenant");
      expect(response.body).toHaveProperty("api_key");
      expect(response.body).toHaveProperty("api_secret");

      expect(response.body.tenant).toMatchObject({
        name: "My Store",
        slug: "my-store",
        plan: "sandbox",
        rate_limit: 2,
      });
      expect(response.body.tenant).toHaveProperty("id_tenant");

      // Credentials should be hex strings
      expect(response.body.api_key).toMatch(/^[a-f0-9]{64}$/);
      expect(response.body.api_secret).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should not require x-api-key header", async () => {
      const response = await request(server).post("/tenants/register").send({
        name: "No Key Store",
        slug: "no-key-store",
        owner_name: "Jane Doe",
        owner_email: "jane@nokey.com",
        owner_password: "SecurePass123",
      });

      expect(response.status).toBe(201);
    });

    it("should allow using the returned API key immediately", async () => {
      const registerRes = await request(server).post("/tenants/register").send({
        name: "Usable Store",
        slug: "usable-store",
        owner_name: "Owner",
        owner_email: "owner@usable.com",
        owner_password: "SecurePass123",
      });

      const { api_key } = registerRes.body;

      const productsRes = await request(server)
        .get("/products")
        .set("x-api-key", api_key);

      expect(productsRes.status).toBe(200);
    });

    it("should allow the owner to login with their credentials", async () => {
      const registerRes = await request(server).post("/tenants/register").send({
        name: "Login Store",
        slug: "login-store",
        owner_name: "Owner",
        owner_email: "owner@login.com",
        owner_password: "MyPassword99",
      });

      const { api_key } = registerRes.body;

      const loginRes = await request(server)
        .post("/login")
        .set("x-api-key", api_key)
        .send({
          email: "owner@login.com",
          password_hash: "MyPassword99",
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty("accessToken");
    });

    it("should return 409 for duplicate slug", async () => {
      const response = await request(server).post("/tenants/register").send({
        name: "Duplicate Store",
        slug: "my-store", // already created in first test
        owner_name: "Another Owner",
        owner_email: "another@test.com",
        owner_password: "SecurePass123",
      });

      expect(response.status).toBe(409);
    });

    it("should return 400 for invalid slug format", async () => {
      const response = await request(server).post("/tenants/register").send({
        name: "Bad Slug Store",
        slug: "INVALID SLUG!",
        owner_name: "Owner",
        owner_email: "owner@bad.com",
        owner_password: "SecurePass123",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors.body).toHaveProperty("slug");
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(server).post("/tenants/register").send({});

      expect(response.status).toBe(400);
      expect(response.body.errors.body).toHaveProperty("name");
      expect(response.body.errors.body).toHaveProperty("slug");
      expect(response.body.errors.body).toHaveProperty("owner_name");
      expect(response.body.errors.body).toHaveProperty("owner_email");
      expect(response.body.errors.body).toHaveProperty("owner_password");
    });

    it("should return 400 for short password", async () => {
      const response = await request(server).post("/tenants/register").send({
        name: "Short Pass Store",
        slug: "short-pass",
        owner_name: "Owner",
        owner_email: "owner@short.com",
        owner_password: "abc",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors.body).toHaveProperty("owner_password");
    });

    it("should return 400 for invalid email", async () => {
      const response = await request(server).post("/tenants/register").send({
        name: "Bad Email Store",
        slug: "bad-email",
        owner_name: "Owner",
        owner_email: "not-an-email",
        owner_password: "SecurePass123",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors.body).toHaveProperty("owner_email");
    });
  });

  describe("POST /tenants/rotate-keys", () => {
    let tenantApiKey: string;
    let tenantApiSecret: string;

    beforeAll(async () => {
      // Create a fresh tenant for rotation tests
      const res = await request(server).post("/tenants/register").send({
        name: "Rotate Store",
        slug: "rotate-store",
        owner_name: "Rotate Owner",
        owner_email: "owner@rotate.com",
        owner_password: "SecurePass123",
      });

      tenantApiKey = res.body.api_key;
      tenantApiSecret = res.body.api_secret;
    });

    it("should return 200 with new credentials", async () => {
      const response = await request(server)
        .post("/tenants/rotate-keys")
        .set("x-api-key", tenantApiKey)
        .set("x-api-secret", tenantApiSecret);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("api_key");
      expect(response.body).toHaveProperty("api_secret");
      expect(response.body.api_key).toMatch(/^[a-f0-9]{64}$/);
      expect(response.body.api_secret).toMatch(/^[a-f0-9]{64}$/);

      // Credentials should be different from the originals
      expect(response.body.api_key).not.toBe(tenantApiKey);
      expect(response.body.api_secret).not.toBe(tenantApiSecret);

      // Update for subsequent tests
      tenantApiKey = response.body.api_key;
      tenantApiSecret = response.body.api_secret;
    });

    it("should invalidate old API key after rotation", async () => {
      const oldKey = tenantApiKey;

      // Rotate
      const rotateRes = await request(server)
        .post("/tenants/rotate-keys")
        .set("x-api-key", tenantApiKey)
        .set("x-api-secret", tenantApiSecret);

      tenantApiKey = rotateRes.body.api_key;
      tenantApiSecret = rotateRes.body.api_secret;

      // Verify invalidate was called for the old key's cache entry
      const crypto = await import("crypto");
      const oldKeyHash = crypto
        .createHash("sha256")
        .update(oldKey)
        .digest("hex");
      expect(RedisService.invalidate).toHaveBeenCalledWith(
        `tenant:hash:${oldKeyHash}`,
      );
    });

    it("should allow using new API key after rotation", async () => {
      const response = await request(server)
        .get("/products")
        .set("x-api-key", tenantApiKey);

      expect(response.status).toBe(200);
    });

    it("should return 401 without x-api-key", async () => {
      const response = await request(server)
        .post("/tenants/rotate-keys")
        .set("x-api-secret", tenantApiSecret);

      expect(response.status).toBe(401);
    });

    it("should return 401 without x-api-secret", async () => {
      const response = await request(server)
        .post("/tenants/rotate-keys")
        .set("x-api-key", tenantApiKey);

      expect(response.status).toBe(401);
    });

    it("should return 401 with wrong x-api-secret", async () => {
      const response = await request(server)
        .post("/tenants/rotate-keys")
        .set("x-api-key", tenantApiKey)
        .set("x-api-secret", "wrong-secret");

      expect(response.status).toBe(401);
    });
  });

  describe("POST /tenants/credentials/rotate (JWT + Sudo Mode)", () => {
    let apiKey: string;
    let adminToken: string;
    let userToken: string;
    const ownerPassword = "AdminPass123";

    beforeAll(async () => {
      // Create a fresh tenant
      const registerRes = await request(server).post("/tenants/register").send({
        name: "Creds Store",
        slug: "creds-store",
        owner_name: "Creds Owner",
        owner_email: "owner@creds.com",
        owner_password: ownerPassword,
      });

      apiKey = registerRes.body.api_key;

      // Login as admin to get JWT
      const loginRes = await request(server)
        .post("/login")
        .set("x-api-key", apiKey)
        .send({
          email: "owner@creds.com",
          password_hash: ownerPassword,
        });

      adminToken = loginRes.body.accessToken;

      // Register a regular user and get their token
      await request(server).post("/register").set("x-api-key", apiKey).send({
        name: "Regular User",
        email: "regular@creds.com",
        password_hash: "UserPass123",
      });

      const userLoginRes = await request(server)
        .post("/login")
        .set("x-api-key", apiKey)
        .send({
          email: "regular@creds.com",
          password_hash: "UserPass123",
        });

      userToken = userLoginRes.body.accessToken;
    });

    it("should rotate credentials with valid JWT and correct password", async () => {
      const response = await request(server)
        .post("/tenants/credentials/rotate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ password: ownerPassword });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("api_key");
      expect(response.body).toHaveProperty("api_secret");
      expect(response.body.api_key).toMatch(/^[a-f0-9]{64}$/);
      expect(response.body.api_secret).toMatch(/^[a-f0-9]{64}$/);

      // Update apiKey for subsequent tests
      apiKey = response.body.api_key;
    });

    it("should allow using the new API key after JWT-based rotation", async () => {
      const response = await request(server)
        .get("/products")
        .set("x-api-key", apiKey);

      expect(response.status).toBe(200);
    });

    it("should call RedisService.invalidate with the old key hash", async () => {
      (RedisService.invalidate as jest.Mock).mockClear();

      const response = await request(server)
        .post("/tenants/credentials/rotate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ password: ownerPassword });

      expect(response.status).toBe(200);
      expect(RedisService.invalidate).toHaveBeenCalledWith(
        expect.stringMatching(/^tenant:hash:[a-f0-9]{64}$/),
      );

      apiKey = response.body.api_key;
    });

    it("should return 401 for incorrect password (Sudo Mode)", async () => {
      const response = await request(server)
        .post("/tenants/credentials/rotate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ password: "WrongPassword999" });

      expect(response.status).toBe(401);
    });

    it("should return 400 when password is missing from body", async () => {
      const response = await request(server)
        .post("/tenants/credentials/rotate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it("should return 403 for non-admin user", async () => {
      const response = await request(server)
        .post("/tenants/credentials/rotate")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ password: "UserPass123" });

      expect(response.status).toBe(403);
    });

    it("should return 401 without Bearer token", async () => {
      const response = await request(server)
        .post("/tenants/credentials/rotate")
        .send({ password: ownerPassword });

      expect(response.status).toBe(401);
    });
  });
});
