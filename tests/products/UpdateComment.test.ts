import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { loginAdmin, createProduct, createAndLoginUser } from "../utils";

describe("Products - UpdateComment", () => {
  let userToken: string = "";
  let productId: number = 0;
  let commentId: number = 0;

  beforeAll(async () => {
    const adminToken = await loginAdmin();
    productId = await createProduct(adminToken);

    const user = await createAndLoginUser({
      name: "Comentador",
      email: "comentador_update@exemple.com",
      password_hash: "senha123456",
    });
    userToken = user.token;

    const comment = await testServer
      .post(`/products/${productId}/comments`)
      .set("authorization", `Bearer ${userToken}`)
      .send({ comment: "Comentário original" });
    commentId = comment.body;
  });

  it("Should update a comment", async () => {
    const result = await testServer
      .put(`/products/${productId}/comments/${commentId}`)
      .set("authorization", `Bearer ${userToken}`)
      .send({ comment: "Comentário atualizado" });

    expect(result.status).toEqual(StatusCodes.NO_CONTENT);
  });

  it("Try to update a comment without text", async () => {
    const result = await testServer
      .put(`/products/${productId}/comments/${commentId}`)
      .set("authorization", `Bearer ${userToken}`)
      .send({ comment: "" });

    expect(result.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(result.body).toHaveProperty("errors.body.comment");
  });

  it("Try to update a comment of another user", async () => {
    const otherUser = await createAndLoginUser({
      name: "Outro User",
      email: "outro_comentador_update@exemple.com",
      password_hash: "senha123456",
    });

    const result = await testServer
      .put(`/products/${productId}/comments/${commentId}`)
      .set("authorization", `Bearer ${otherUser.token}`)
      .send({ comment: "Tentativa de edição" });

    expect(result.status).toEqual(StatusCodes.FORBIDDEN);
    expect(result.body).toHaveProperty("errors.default");
  });

  it("Try to update a comment without authorization", async () => {
    const result = await testServer
      .put(`/products/${productId}/comments/${commentId}`)
      .send({ comment: "Sem auth" });

    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(result.body).toHaveProperty("errors.default");
  });
});
