import request from "supertest";
import { server } from "../../../src/server/server";

describe("Health Routes", () => {
  it("GET /health should return 200 with status ok", async () => {
    const response = await request(server).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("timestamp");
  });

  it("GET /health should not require x-api-key header", async () => {
    const response = await request(server).get("/health");

    // Should succeed without any authentication headers
    expect(response.status).toBe(200);
  });

  it("GET /health should return checks for database and redis", async () => {
    const response = await request(server).get("/health");

    expect(response.body).toHaveProperty("checks");
    expect(response.body.checks).toHaveProperty("database");
    expect(response.body.checks).toHaveProperty("redis");
  });

  it("GET /health checks should report individual service status", async () => {
    const response = await request(server).get("/health");

    // DB should be ok since tests connect to real PostgreSQL
    expect(response.body.checks.database).toBe("ok");
    // Redis is mocked in tests, so it may be "ok" or "error"
    expect(["ok", "error"]).toContain(response.body.checks.redis);
  });
});
