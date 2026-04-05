import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createCategory } from "../utils";

describe("Products - DeleteCategory", () => {
  let adminToken: string = "";
  let productId: number = 0;
  let categoryId: number = 0;

  beforeAll(async () => {
    adminToken = await loginAdmin();
    productId = await createProduct(adminToken);
    categoryId = await createCategory(adminToken);

    await testServer
      .post(`/products/${productId}/categories`)
      .set("authorization", `Bearer ${adminToken}`)
      .send({ category_id: categoryId });
  });

  it("Should remove a category from a product", async () => {
    const result = await testServer
      .delete(`/products/${productId}/categories/${categoryId}`)
      .set("authorization", `Bearer ${adminToken}`)
      .send();

    expect(result.status).toEqual(StatusCodes.NO_CONTENT);
  });

  it("Try to remove a category without authorization", async () => {
    const result = await testServer
      .delete(`/products/${productId}/categories/${categoryId}`)
      .send();

    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(result.body).toHaveProperty("errors.default");
  });
});
