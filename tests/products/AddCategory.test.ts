import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createCategory } from "../utils";

describe("Products - AddCategory", () => {
  let adminToken: string = "";
  let productId: number = 0;
  let categoryId: number = 0;

  beforeAll(async () => {
    adminToken = await loginAdmin();
    productId = await createProduct(adminToken);
    categoryId = await createCategory(adminToken);
  });

  it("Should add a category to a product", async () => {
    const result = await testServer
      .post(`/products/${productId}/categories`)
      .set("authorization", `Bearer ${adminToken}`)
      .send({ category_id: categoryId });

    expect(result.status).toEqual(StatusCodes.CREATED);
  });

  it("Try to add a non-existing category to a product", async () => {
    const result = await testServer
      .post(`/products/${productId}/categories`)
      .set("authorization", `Bearer ${adminToken}`)
      .send({ category_id: 99999 });

    expect(result.status).toEqual(StatusCodes.NOT_FOUND);
    expect(result.body).toHaveProperty("errors.default");
  });

  it("Try to add a category without authorization", async () => {
    const result = await testServer
      .post(`/products/${productId}/categories`)
      .send({ category_id: categoryId });

    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(result.body).toHaveProperty("errors.default");
  });
});
