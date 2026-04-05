import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createAndLoginUser } from "../utils";

describe("Products - DeleteComment", () => {
  let userToken: string = "";
  let productId: number = 0;
  let commentId: number = 0;

  beforeAll(async () => {
    const adminToken = await loginAdmin();
    productId = await createProduct(adminToken);

    const user = await createAndLoginUser({
      name: "Comentador",
      email: "comentador_delete@exemple.com",
      password_hash: "senha123456",
    });
    userToken = user.token;

    const comment = await testServer
      .post(`/products/${productId}/comments`)
      .set("authorization", `Bearer ${userToken}`)
      .send({ comment: "Comentário para deletar" });
    commentId = comment.body;
  });

  it("Try to delete a comment of another user", async () => {
    const otherUser = await createAndLoginUser({
      name: "Outro User",
      email: "outro_comentador_delete@exemple.com",
      password_hash: "senha123456",
    });

    const result = await testServer
      .delete(`/products/${productId}/comments/${commentId}`)
      .set("authorization", `Bearer ${otherUser.token}`)
      .send();

    expect(result.status).toEqual(StatusCodes.FORBIDDEN);
    expect(result.body).toHaveProperty("errors.default");
  });

  it("Should delete a comment", async () => {
    const result = await testServer
      .delete(`/products/${productId}/comments/${commentId}`)
      .set("authorization", `Bearer ${userToken}`)
      .send();

    expect(result.status).toEqual(StatusCodes.NO_CONTENT);
  });

  it("Try to delete a comment without authorization", async () => {
    const result = await testServer
      .delete(`/products/${productId}/comments/${commentId}`)
      .send();

    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(result.body).toHaveProperty("errors.default");
  });
});
