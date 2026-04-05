import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct } from "../utils";

describe("Products - GetById", () => {
  let productId: number = 0;

  beforeAll(async () => {
    const adminToken = await loginAdmin();
    productId = await createProduct(adminToken);
  });

  it("Should get a product by id", async () => {
    const product = await testServer.get(`/products/${productId}`).send();

    expect(product.status).toEqual(StatusCodes.OK);
    expect(product.body).toHaveProperty("id_product");
    expect(Number(product.body.id_product)).toEqual(productId);
  });

  it("Try to get a non-existing product", async () => {
    const product = await testServer.get("/products/99999").send();

    expect(product.status).toEqual(StatusCodes.NOT_FOUND);
    expect(product.body).toHaveProperty("errors.default");
  });

  it("Try to get a product with negative id", async () => {
    const product = await testServer.get("/products/-1").send();

    expect(product.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(product.body).toHaveProperty("errors.params.id");
  });
});
