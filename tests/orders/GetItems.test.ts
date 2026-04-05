import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createAndLoginUser } from "../utils";

describe("Orders - GetItems", () => {
  let userToken: string = "";
  let orderId: number = 0;

  beforeAll(async () => {
    const adminToken = await loginAdmin();
    const productId = await createProduct(adminToken);

    const user = await createAndLoginUser({
      name: "Order GetItems",
      email: "order_getitems@exemple.com",
      password_hash: "senha123456",
    });
    userToken = user.token;

    await testServer
      .post("/carts/items")
      .set("authorization", `Bearer ${userToken}`)
      .send({ product_id: productId, quantity: 2 });

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

  it("Should get items from an order", async () => {
    const result = await testServer
      .get(`/orders/${orderId}/items`)
      .set("authorization", `Bearer ${userToken}`)
      .send();

    expect(result.status).toEqual(StatusCodes.OK);
  });

  it("Try to get order items without authorization", async () => {
    const result = await testServer
      .get(`/orders/${orderId}/items`)
      .send();

    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(result.body).toHaveProperty("errors.default");
  });
});
