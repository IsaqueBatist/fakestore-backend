import { UserProvider } from "../../database/providers/user";
import { passwordCrypto } from "../../shared/services";
import { AppError } from "../../errors";

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const user = await UserProvider.getByToken(token);

  if (!user.password_reset_expires) {
    throw new AppError("errors:token_expired");
  }

  const now = new Date();
  const expirationDate = new Date(user.password_reset_expires);

  if (now > expirationDate) {
    throw new AppError("errors:token_expired");
  }

  const hashedPassword = await passwordCrypto.hashPassword(newPassword);

  await UserProvider.updatePassword(user.id_user, hashedPassword);
};
