import { testServer } from "../jest.setup";

export const loginAdmin = async (): Promise<string> => {
  const admin = await testServer.post("/login").send({
    email: "admin@exemple.com",
    password_hash: "adminSenha123",
  });
  return admin.body.accessToken;
};
