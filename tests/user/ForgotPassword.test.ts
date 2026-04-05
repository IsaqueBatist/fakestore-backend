import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";

describe("User - ForgotPassword", () => {
  beforeAll(async () => {
    await testServer.post("/register").send({
      name: "Forgot User",
      email: "forgot_user@exemple.com",
      password_hash: "senha123456",
    });
  });

  it("Should send password reset email for existing user", async () => {
    const result = await testServer.post("/forgot-password").send({
      email: "forgot_user@exemple.com",
    });

    expect(result.status).toEqual(StatusCodes.OK);
    expect(result.body).toHaveProperty("message");
  });

  it("Should return OK even for non-existing email (security)", async () => {
    const result = await testServer.post("/forgot-password").send({
      email: "naoexiste@exemple.com",
    });

    expect(result.status).toEqual(StatusCodes.OK);
    expect(result.body).toHaveProperty("message");
  });

  it("Try to send forgot password with invalid email", async () => {
    const result = await testServer.post("/forgot-password").send({
      email: "emailinvalido",
    });

    expect(result.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(result.body).toHaveProperty("errors.body.email");
  });

  it("Try to send forgot password without email", async () => {
    const result = await testServer.post("/forgot-password").send({
      email: "",
    });

    expect(result.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(result.body).toHaveProperty("errors.body.email");
  });
});
