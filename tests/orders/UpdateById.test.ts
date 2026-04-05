import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createAndLoginUser } from "../utils";

describe("Orders - UpdateById", () => {
  let userToken: string = "";
  let orderId: number = 0;

  beforeAll(async () => {
    const adminToken = await loginAdmin();
    const productId = await createProduct(adminToken);

    const user = await createAndLoginUser({
      name: "Order Update",
      email: "order_update@exemple.com",
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

  it("Should update an order", async () => {
    const result = await testServer
      .put(`/orders/${orderId}`)
      .set("authorization", `Bearer ${userToken}`)
      .send({ total: 500, status: "shipped" });

    expect(result.status).toEqual(StatusCodes.NO_CONTENT);
  });

  it("Try to update an order of another user", async () => {
    const otherUser = await createAndLoginUser({
      name: "Outro User",
      email: "order_update_other@exemple.com",
      password_hash: "senha123456",
    });

    const result = await testServer
      .put(`/orders/${orderId}`)
      .set("authorization", `Bearer ${otherUser.token}`)
      .send({ total: 500, status: "shipped" });

    expect(result.status).toEqual(StatusCodes.FORBIDDEN);
    expect(result.body).toHaveProperty("errors.default");
  });

  it("Try to update an order without authorization", async () => {
    const result = await testServer
      .put(`/orders/${orderId}`)
      .send({ total: 500, status: "shipped" });

    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(result.body).toHaveProperty("errors.default");
  });
});
