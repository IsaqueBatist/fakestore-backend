import { testServer } from "../jest.setup";

interface IUserData {
  name: string;
  email: string;
  password_hash: string;
}

export const createAndLoginUser = async (userData: IUserData) => {
  const register = await testServer.post('/register').send(userData);
  const login = await testServer.post('/login').send({
    email: userData.email,
    password_hash: userData.password_hash,
  });
  return {
    userId: register.body,
    token: login.body.accessToken
  };
};