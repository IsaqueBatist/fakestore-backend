import { UserProvider } from "../../database/providers/user";
import { passwordCrypto, JWTService } from "../../shared/services";
import { UnauthorizedError, NotFoundError } from "../../errors";

export const signIn = async (
  email: string,
  password: string,
): Promise<{ accessToken: string }> => {
  let user;
  try {
    user = await UserProvider.getByEmail(email);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError("errors:incorrect_credentials");
    }
    throw error;
  }

  const passwordMatch = await passwordCrypto.verifyPassword(
    password,
    user.password_hash,
  );

  if (!passwordMatch) {
    throw new UnauthorizedError("errors:incorrect_credentials");
  }

  const accessToken = JWTService.sign({
    uid: user.id_user,
    role: user.role,
  });

  return { accessToken };
};
