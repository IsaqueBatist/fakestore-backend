import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createAndLoginUser } from "../utils";

describe("Orders - DeleteItem", () => {
  let userToken: string = "";
  let orderId: number = 0;
  let orderItemId: number = 0;

  beforeAll(async () => {
    const adminToken = await loginAdmin();
    const productId = await createProduct(adminToken);
    const productId2 = await createProduct(adminToken);

    const user = await createAndLoginUser({
      name: "Order DeleteItem",
      email: "order_deleteitem@exemple.com",
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

    // Add another item to have something to delete
    const addedItem = await testServer
      .post(`/orders/${orderId}/items`)
      .set("authorization", `Bearer ${userToken}`)
      .send({
        product_id: productId2,
        quantity: 1,
        unt_price: 50,
      });
    orderItemId = addedItem.body;
  });

  it("Should delete an item from an order", async () => {
    const result = await testServer
      .delete(`/orders/${orderId}/items/${orderItemId}`)
      .set("authorization", `Bearer ${userToken}`)
      .send();

    expect(result.status).toEqual(StatusCodes.NO_CONTENT);
  });

  it("Try to delete an item without authorization", async () => {
    const result = await testServer
      .delete(`/orders/${orderId}/items/${orderItemId}`)
      .send();

    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(result.body).toHaveProperty("errors.default");
  });
});
