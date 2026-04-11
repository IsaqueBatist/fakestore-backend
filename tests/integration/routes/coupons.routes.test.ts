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
import { insertUser, insertCoupon, resetCounters } from "../../helpers/factories";

describe("Coupons Routes", () => {
  let tenant: TestTenant;
  let adminToken: string;
  let userToken: string;
  let testCouponId: number;

  beforeAll(async () => {
    await cleanupTables();
    tenant = await seedTestTenant();
    resetCounters();

    const trx = await createTenantTrx(tenant.id_tenant);
    try {
      const admin = await insertUser(trx, {
        email: "couponadmin@test.com",
        role: "admin",
      });
      const user = await insertUser(trx, { email: "couponuser@test.com" });

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

  describe("POST /v1/coupons (admin create)", () => {
    it("should return 201 for admin creating a valid coupon", async () => {
      const response = await request(server)
        .post("/v1/coupons")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "WELCOME15",
          discount_type: "percentage",
          discount_value_cents: 1500,
        });

      expect(response.status).toBe(201);
      testCouponId = typeof response.body === "number" ? response.body : response.body.id_coupon ?? response.body;
    });

    it("should return 403 for non-admin user", async () => {
      const response = await request(server)
        .post("/v1/coupons")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          code: "FORBIDDEN10",
          discount_type: "percentage",
          discount_value_cents: 1000,
        });

      expect(response.status).toBe(403);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(server)
        .post("/v1/coupons")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "INCOMPLETE",
        });

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid discount_type", async () => {
      const response = await request(server)
        .post("/v1/coupons")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "BADTYPE",
          discount_type: "invalid_type",
          discount_value_cents: 1000,
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /v1/coupons (admin list)", () => {
    it("should return 200 with list of coupons for admin", async () => {
      const response = await request(server)
        .get("/v1/coupons")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it("should return 403 for non-admin user", async () => {
      const response = await request(server)
        .get("/v1/coupons")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("POST /v1/coupons/validate (authenticated)", () => {
    let percentageCouponCode: string;
    let fixedCouponCode: string;
    let expiredCouponCode: string;
    let minOrderCouponCode: string;

    beforeAll(async () => {
      // Create percentage coupon: 15% off
      const pctRes = await request(server)
        .post("/v1/coupons")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "PCT15",
          discount_type: "percentage",
          discount_value_cents: 1500,
        });
      expect(pctRes.status).toBe(201);
      percentageCouponCode = "PCT15";

      // Create fixed coupon: R$5.00 off
      const fixedRes = await request(server)
        .post("/v1/coupons")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "FIXED5",
          discount_type: "fixed",
          discount_value_cents: 500,
        });
      expect(fixedRes.status).toBe(201);
      fixedCouponCode = "FIXED5";

      // Create expired coupon via DB (expires_at in the past)
      const trx = await createTenantTrx(tenant.id_tenant);
      try {
        const expiredCoupon = await insertCoupon(trx, {
          code: "EXPIRED01",
          discount_type: "percentage",
          discount_value_cents: 1000,
          expires_at: new Date("2020-01-01T00:00:00Z"),
        });
        expiredCouponCode = expiredCoupon.code;

        const minOrderCoupon = await insertCoupon(trx, {
          code: "MINORDER",
          discount_type: "percentage",
          discount_value_cents: 1000,
          min_order_cents: 100000, // R$1000
        });
        minOrderCouponCode = minOrderCoupon.code;

        await trx.commit();
      } catch (err) {
        await trx.rollback();
        throw err;
      }
    });

    it("should return 200 with valid=true and correct discount for percentage coupon", async () => {
      const response = await request(server)
        .post("/v1/coupons/validate")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          code: percentageCouponCode,
          order_total_cents: 10000,
        });

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body.discount_cents).toBe(1500); // 15% of 10000
    });

    it("should return 200 with valid=true for fixed discount coupon", async () => {
      const response = await request(server)
        .post("/v1/coupons/validate")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          code: fixedCouponCode,
          order_total_cents: 10000,
        });

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body.discount_cents).toBe(500); // R$5.00 fixed
    });

    it("should return 400 for non-existent coupon code", async () => {
      const response = await request(server)
        .post("/v1/coupons/validate")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          code: "DOESNOTEXIST",
          order_total_cents: 10000,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should return 400 for expired coupon", async () => {
      const response = await request(server)
        .post("/v1/coupons/validate")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          code: expiredCouponCode,
          order_total_cents: 10000,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should return 400 when order total is below minimum", async () => {
      const response = await request(server)
        .post("/v1/coupons/validate")
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          code: minOrderCouponCode,
          order_total_cents: 5000, // R$50, below R$1000 min
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(server)
        .post("/v1/coupons/validate")
        .set("x-api-key", TEST_API_KEY_1)
        .send({
          code: percentageCouponCode,
          order_total_cents: 10000,
        });

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /v1/coupons/:id (admin update)", () => {
    it("should return 204 for admin updating coupon", async () => {
      const response = await request(server)
        .put(`/v1/coupons/${testCouponId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "UPDATED15",
          discount_value_cents: 2000,
        });

      expect(response.status).toBe(204);
    });

    it("should return 403 for non-admin", async () => {
      const response = await request(server)
        .put(`/v1/coupons/${testCouponId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          code: "HACKATTEMPT",
        });

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /v1/coupons/:id (admin delete)", () => {
    it("should return 403 for non-admin", async () => {
      const response = await request(server)
        .delete(`/v1/coupons/${testCouponId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it("should return 204 for admin deleting coupon", async () => {
      const response = await request(server)
        .delete(`/v1/coupons/${testCouponId}`)
        .set("x-api-key", TEST_API_KEY_1)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });
  });
});
