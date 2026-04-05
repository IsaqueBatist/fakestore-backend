import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct } from "../utils";

describe("Products - GetAll", () => {
  beforeAll(async () => {
    const adminToken = await loginAdmin();
    await createProduct(adminToken);
    await createProduct(adminToken);
  });

  it("Should get all products", async () => {
    const products = await testServer.get("/products").send();

    expect(products.status).toEqual(StatusCodes.OK);
    expect(products.body.length).toBeGreaterThan(0);
    expect(Number(products.headers["x-total-count"])).toBeGreaterThan(0);
  });

  it("Should get products with pagination", async () => {
    const products = await testServer.get("/products?page=1&limit=1").send();

    expect(products.status).toEqual(StatusCodes.OK);
    expect(products.body.length).toBeLessThanOrEqual(1);
  });

  it("Try to get products with negative page", async () => {
    const products = await testServer.get("/products?page=-1").send();

    expect(products.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(products.body).toHaveProperty("errors.query.page");
  });

  it("Try to get products with negative limit", async () => {
    const products = await testServer.get("/products?limit=-1").send();

    expect(products.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(products.body).toHaveProperty("errors.query.limit");
  });
});
