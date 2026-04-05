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
});
