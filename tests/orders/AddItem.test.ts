import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createAndLoginUser } from "../utils";

describe("Orders - AddItem", () => {
  let userToken: string = "";
  let orderId: number = 0;
  let productId2: number = 0;

  beforeAll(async () => {
    const adminToken = await loginAdmin();
    const productId = await createProduct(adminToken);
    productId2 = await createProduct(adminToken);

    const user = await createAndLoginUser({
      name: "Order AddItem",
      email: "order_additem@exemple.com",
      password_hash: "senha123456",
    });
    userToken = user.token;

    await testServer
      .post("/carts/items")
      .set("authorization", `Bearer ${userToken}`)
      .send({ product_id: productId, quantity: 1 });

    await testServer
      .post("/orders/from-cart")
      .set("authorization", `Bearer ${userToken}`)
      .send();

    const orders = await testServer
      .get("/orders")
      .set("authorization", `Bearer ${userToken}`)
      .send();
    orderId = orders.body[0].id_order;
  });

  it("Should add an item to an order", async () => {
    const result = await testServer
      .post(`/orders/${orderId}/items`)
      .set("authorization", `Bearer ${userToken}`)
      .send({
        product_id: productId2,
        quantity: 3,
        unt_price: 99.9,
      });

    expect(result.status).toEqual(StatusCodes.CREATED);
  });

  it("Try to add an item without authorization", async () => {
    const result = await testServer
      .post(`/orders/${orderId}/items`)
      .send({
        product_id: productId2,
        quantity: 1,
        unt_price: 50,
      });

    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(result.body).toHaveProperty("errors.default");
  });
});
