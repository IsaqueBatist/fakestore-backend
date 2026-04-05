import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct } from "../utils";

describe("Products - UpdateById", () => {
  let adminToken: string = "";
  let productId: number = 0;

  beforeAll(async () => {
    adminToken = await loginAdmin();
    productId = await createProduct(adminToken);
  });

  it("Should update a product", async () => {
    const product = await testServer
      .put(`/products/${productId}`)
      .set("authorization", `Bearer ${adminToken}`)
      .send({
        name: "Tênis Atualizado",
        description: "Descrição atualizada.",
        price: 249.9,
        image_url: "https://example.com/images/tenis-atualizado.jpg",
        rating: 5,
        stock: 200,
        specifications: { color: "white", size: "43" },
      });

    expect(product.status).toEqual(StatusCodes.NO_CONTENT);
  });

  it("Try to update a product with short name", async () => {
    const product = await testServer
      .put(`/products/${productId}`)
      .set("authorization", `Bearer ${adminToken}`)
      .send({
        name: "Te",
        description: "Descrição",
        price: 10,
        image_url: "https://example.com/img.jpg",
        rating: 4,
        stock: 50,
        specifications: {},
      });

    expect(product.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(product.body).toHaveProperty("errors.body.name");
  });

  it("Try to update a product without authorization", async () => {
    const product = await testServer.put(`/products/${productId}`).send({
      name: "Produto Teste",
      description: "Descrição",
      price: 10,
      image_url: "https://example.com/img.jpg",
      rating: 4,
      specifications: {},
    });

    expect(product.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(product.body).toHaveProperty("errors.default");
  });
});
