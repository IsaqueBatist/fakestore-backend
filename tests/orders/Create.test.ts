import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createAndLoginUser } from "../utils";

describe("Orders - Create", () => {
  let userToken: string = "";

  beforeAll(async () => {
    const adminToken = await loginAdmin();
    const productId = await createProduct(adminToken);

    const user = await createAndLoginUser({
      name: "Order User",
      email: "order_create@exemple.com",
      password_hash: "senha123456",
    });
    userToken = user.token;

    // Add item to cart (DB cart)
    await testServer
      .post("/carts/items")
      .set("authorization", `Bearer ${userToken}`)
      .send({ product_id: productId, quantity: 2 });
  });

  it("Should create an order from cart", async () => {
    const result = await testServer
      .post("/orders/from-cart")
      .set("authorization", `Bearer ${userToken}`)
      .send();

    expect(result.status).toEqual(StatusCodes.CREATED);
  });

  it("Try to create an order without authorization", async () => {
    const result = await testServer.post("/orders/from-cart").send();

    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(result.body).toHaveProperty("errors.default");
  });
});
