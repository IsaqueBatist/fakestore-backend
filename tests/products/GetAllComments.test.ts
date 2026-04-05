import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createAndLoginUser } from "../utils";

describe("Products - GetAllComments", () => {
  let productId: number = 0;

  beforeAll(async () => {
    const adminToken = await loginAdmin();
    productId = await createProduct(adminToken);

    const user = await createAndLoginUser({
      name: "Comentador",
      email: "comentador_getall@exemple.com",
      password_hash: "senha123456",
    });

    await testServer
      .post(`/products/${productId}/comments`)
      .set("authorization", `Bearer ${user.token}`)
      .send({ comment: "Comentário de teste" });
  });

  it("Should get all comments for a product", async () => {
    const result = await testServer
      .get(`/products/${productId}/comments`)
      .send();

    expect(result.status).toEqual(StatusCodes.OK);
    expect(result.body.length).toBeGreaterThan(0);
  });

  it("Try to get comments for a non-existing product", async () => {
    const result = await testServer
      .get("/products/99999/comments")
      .send();

    expect(result.status).toEqual(StatusCodes.NOT_FOUND);
    expect(result.body).toHaveProperty("errors.default");
  });
});
