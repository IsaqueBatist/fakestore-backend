import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createCategory } from "../utils";

describe("Products - GetAllCategories", () => {
  let productId: number = 0;

  beforeAll(async () => {
    const adminToken = await loginAdmin();
    productId = await createProduct(adminToken);
    const categoryId = await createCategory(adminToken);

    await testServer
      .post(`/products/${productId}/categories`)
      .set("authorization", `Bearer ${adminToken}`)
      .send({ category_id: categoryId });
  });

  it("Should get all categories for a product", async () => {
    const result = await testServer
      .get(`/products/${productId}/categories`)
      .send();

    expect(result.status).toEqual(StatusCodes.OK);
    expect(result.body.length).toBeGreaterThan(0);
  });

  it("Try to get categories for a non-existing product", async () => {
    const result = await testServer
      .get("/products/99999/categories")
      .send();

    expect(result.status).toEqual(StatusCodes.OK);
  });
});
