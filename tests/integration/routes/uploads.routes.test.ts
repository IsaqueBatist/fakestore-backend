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
import { insertUser, resetCounters } from "../../helpers/factories";

// Mock the ImageService to avoid real S3/R2 calls
jest.mock("../../../src/server/shared/services/ImageService", () => ({
  generateUploadUrl: jest.fn(
    async (tenantId: number, filename: string, mimeType: string) => ({
      uploadUrl: `https://r2.example.com/presigned?tenant=${tenantId}`,
      objectKey: `tenants/${tenantId}/products/${Date.now()}-${filename}`,
      publicUrl: `https://cdn.example.com/tenants/${tenantId}/products/${filename}`,
    }),
  ),
  deleteObject: jest.fn(async () => {}),
}));

describe("Uploads Routes", () => {
  let tenant: TestTenant;
  let userToken: string;

  beforeAll(async () => {
    await cleanupTables();
    tenant = await seedTestTenant();
    resetCounters();

    const trx = await createTenantTrx(tenant.id_tenant);
    try {
      const user = await insertUser(trx, { email: "uploaduser@test.com" });

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

  describe("POST /v1/uploads/presign", () => {
    it("should return 200 with uploadUrl, objectKey, publicUrl for valid request", async () => {
      const response = await request(server)
        .post("/v1/uploads/presign")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ filename: "product-photo.jpg", mime_type: "image/jpeg" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("uploadUrl");
      expect(response.body).toHaveProperty("objectKey");
      expect(response.body).toHaveProperty("publicUrl");
      expect(response.body.uploadUrl).toContain("r2.example.com");
      expect(response.body.objectKey).toContain(`tenants/${tenant.id_tenant}/`);
      expect(response.body.publicUrl).toContain("cdn.example.com");
    });

    it("should return 400 for invalid mime_type", async () => {
      const response = await request(server)
        .post("/v1/uploads/presign")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ filename: "photo.gif", mime_type: "image/gif" });

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing filename", async () => {
      const response = await request(server)
        .post("/v1/uploads/presign")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ mime_type: "image/jpeg" });

      expect(response.status).toBe(400);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(server)
        .post("/v1/uploads/presign")
        .set("x-api-key", TEST_API_KEY_1)
        .send({ filename: "product-photo.jpg", mime_type: "image/jpeg" });

      expect(response.status).toBe(401);
    });
  });
});
