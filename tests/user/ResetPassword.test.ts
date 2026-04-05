import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { v4 as uuidv4 } from "uuid";

describe("User - ResetPassword", () => {
  it("Try to reset password with invalid token", async () => {
    const result = await testServer.post("/reset-password").send({
      token: uuidv4(),
      newPassword: "novaSenha123",
    });

    expect(result.status).toEqual(StatusCodes.NOT_FOUND);
    expect(result.body).toHaveProperty("errors.default");
  });

  it("Try to reset password with non-UUID token", async () => {
    const result = await testServer.post("/reset-password").send({
      token: "token-invalido",
      newPassword: "novaSenha123",
    });

    expect(result.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(result.body).toHaveProperty("errors.body.token");
  });

  it("Try to reset password with short password", async () => {
    const result = await testServer.post("/reset-password").send({
      token: uuidv4(),
      newPassword: "123",
    });

    expect(result.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(result.body).toHaveProperty("errors.body.newPassword");
  });

  it("Try to reset password without token", async () => {
    const result = await testServer.post("/reset-password").send({
      token: "",
      newPassword: "novaSenha123",
    });

    expect(result.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(result.body).toHaveProperty("errors.body.token");
  });
});
