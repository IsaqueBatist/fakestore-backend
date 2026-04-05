import { UserProvider } from "../../database/providers/user";
import { passwordCrypto, JWTService } from "../../shared/services";
import { UnauthorizedError, NotFoundError } from "../../errors";
import type { Knex } from "knex";

export const signIn = async (
  trx: Knex.Transaction,
  tenantId: number,
  email: string,
  password: string,
): Promise<{ accessToken: string }> => {
  let user;
  try {
    user = await UserProvider.getByEmail(email, trx);
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
    tid: tenantId,
  });

  return { accessToken };
};
