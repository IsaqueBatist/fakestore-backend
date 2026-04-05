import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct } from "../utils";

describe("Products - DeleteById", () => {
  let adminToken: string = "";
  let productId: number = 0;

  beforeAll(async () => {
    adminToken = await loginAdmin();
    productId = await createProduct(adminToken);
  });

  it("Should delete a product", async () => {
    const product = await testServer
      .delete(`/products/${productId}`)
      .set("authorization", `Bearer ${adminToken}`)
      .send();

    expect(product.status).toEqual(StatusCodes.NO_CONTENT);
  });

  it("Try to delete a non-existing product", async () => {
    const product = await testServer
      .delete(`/products/${productId}`)
      .set("authorization", `Bearer ${adminToken}`)
      .send();

    expect(product.status).toEqual(StatusCodes.NOT_FOUND);
    expect(product.body).toHaveProperty("errors.default");
  });

  it("Try to delete a product without authorization", async () => {
    const product = await testServer
      .delete(`/products/${productId}`)
      .send();

    expect(product.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(product.body).toHaveProperty("errors.default");
  });
});
