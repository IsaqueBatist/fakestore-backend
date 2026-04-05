import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin } from "../utils";

describe("Products - Create", () => {
  let adminToken: string = "";
  let userToken: string = "";

  beforeAll(async () => {
    adminToken = await loginAdmin();

    await testServer.post("/register").send({
      name: "User Normal",
      email: "usernormal_product_create@exemple.com",
      password_hash: "senha123456",
    });
    const login = await testServer.post("/login").send({
      email: "usernormal_product_create@exemple.com",
      password_hash: "senha123456",
    });
    userToken = login.body.accessToken;
  });

  it("Should create a product", async () => {
    const product = await testServer
      .post("/products")
      .set("authorization", `Bearer ${adminToken}`)
      .send({
        name: "Tênis Esportivo",
        description: "Tênis confortável para corrida e caminhada.",
        price: 199.9,
        image_url: "https://example.com/images/tenis-esportivo.jpg",
        rating: 4.5,
        stock: 100,
        specifications: { color: "black", size: "42" },
      });

    expect(product.status).toEqual(StatusCodes.CREATED);
    expect(typeof product.body).toEqual("number");
  });

  it("Try to create a product with short name", async () => {
    const product = await testServer
      .post("/products")
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

  it("Try to create a product without description", async () => {
    const product = await testServer
      .post("/products")
      .set("authorization", `Bearer ${adminToken}`)
      .send({
        name: "Produto Teste",
        description: "",
        price: 10,
        image_url: "https://example.com/img.jpg",
        rating: 4,
        stock: 50,
        specifications: {},
      });

    expect(product.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(product.body).toHaveProperty("errors.body.description");
  });

  it("Try to create a product with price 0", async () => {
    const product = await testServer
      .post("/products")
      .set("authorization", `Bearer ${adminToken}`)
      .send({
        name: "Produto Teste",
        description: "Descrição",
        price: 0,
        image_url: "https://example.com/img.jpg",
        rating: 4,
        stock: 50,
        specifications: {},
      });

    expect(product.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(product.body).toHaveProperty("errors.body.price");
  });

  it("Try to create a product without authorization", async () => {
    const product = await testServer.post("/products").send({
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

  it("Try to create a product as non-admin user", async () => {
    const product = await testServer
      .post("/products")
      .set("authorization", `Bearer ${userToken}`)
      .send({
        name: "Produto Teste",
        description: "Descrição",
        price: 10,
        image_url: "https://example.com/img.jpg",
        rating: 4,
        stock: 50,
        specifications: {},
      });

    expect(product.status).toEqual(StatusCodes.FORBIDDEN);
    expect(product.body).toHaveProperty("errors.default");
  });
});
