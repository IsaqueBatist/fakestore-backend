import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createAndLoginUser } from "../utils";

describe("Orders - GetByUserId", () => {
  let userToken: string = "";

  beforeAll(async () => {
    const adminToken = await loginAdmin();
    const productId = await createProduct(adminToken);

    const user = await createAndLoginUser({
      name: "Order GetUser",
      email: "order_getbyuser@exemple.com",
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
  });

  it("Should get all user orders", async () => {
    const result = await testServer
      .get("/orders")
      .set("authorization", `Bearer ${userToken}`)
      .send();

    expect(result.status).toEqual(StatusCodes.OK);
    expect(result.body.length).toBeGreaterThan(0);
  });

  it("Try to get orders without authorization", async () => {
    const result = await testServer.get("/orders").send();

    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(result.body).toHaveProperty("errors.default");
  });
});
