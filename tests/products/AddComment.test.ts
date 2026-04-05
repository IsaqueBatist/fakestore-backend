import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createAndLoginUser } from "../utils";

describe("Products - AddComment", () => {
  let userToken: string = "";
  let productId: number = 0;

  beforeAll(async () => {
    const adminToken = await loginAdmin();
    productId = await createProduct(adminToken);

    const user = await createAndLoginUser({
      name: "Comentador",
      email: "comentador_add@exemple.com",
      password_hash: "senha123456",
    });
    userToken = user.token;
  });

  it("Should add a comment to a product", async () => {
    const result = await testServer
      .post(`/products/${productId}/comments`)
      .set("authorization", `Bearer ${userToken}`)
      .send({ comment: "Ótimo produto!" });

    expect(result.status).toEqual(StatusCodes.CREATED);
    expect(typeof result.body).toEqual("number");
  });

  it("Try to add a comment without text", async () => {
    const result = await testServer
      .post(`/products/${productId}/comments`)
      .set("authorization", `Bearer ${userToken}`)
      .send({ comment: "" });

    expect(result.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(result.body).toHaveProperty("errors.body.comment");
  });

  it("Try to add a comment without authorization", async () => {
    const result = await testServer
      .post(`/products/${productId}/comments`)
      .send({ comment: "Teste" });

    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(result.body).toHaveProperty("errors.default");
  });
});
