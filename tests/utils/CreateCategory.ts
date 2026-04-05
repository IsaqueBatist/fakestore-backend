import { testServer } from "../jest.setup";

export const createCategory = async (token: string): Promise<number> => {
  const category = await testServer
    .post("/categories")
    .set("authorization", `Bearer ${token}`)
    .send({
      name: "Categoria Teste",
      description: "Categoria feita para testar",
    });
  return category.body;
};
