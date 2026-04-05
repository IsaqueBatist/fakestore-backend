import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createAndLoginUser } from "../utils";

describe("Orders - DeleteById", () => {
  let adminToken: string = "";
  let userToken: string = "";
  let orderId: number = 0;

  beforeAll(async () => {
    adminToken = await loginAdmin();
    const productId = await createProduct(adminToken);

    const user = await createAndLoginUser({
      name: "Order Delete",
      email: "order_delete@exemple.com",
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

  it("Should delete an order", async () => {
    const result = await testServer
      .delete(`/orders/${orderId}`)
      .set("authorization", `Bearer ${userToken}`)
      .send();

    expect(result.status).toEqual(StatusCodes.NO_CONTENT);
  });

  it("Try to delete a non-existing order", async () => {
    const result = await testServer
      .delete(`/orders/${orderId}`)
      .set("authorization", `Bearer ${userToken}`)
      .send();

    expect(result.status).toEqual(StatusCodes.NOT_FOUND);
    expect(result.body).toHaveProperty("errors.default");
  });

  it("Try to delete an order without authorization", async () => {
    const result = await testServer.delete(`/orders/${orderId}`).send();

    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(result.body).toHaveProperty("errors.default");
  });
});
