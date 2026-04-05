import { v4 as uuidv4 } from "uuid";
import { UserProvider } from "../../database/providers/user";
import { sendForgotPasswordEmail } from "../../shared/services";
import type { Knex } from "knex";

export const forgotPassword = async (trx: Knex.Transaction, email: string): Promise<void> => {
  let user = null;
  try {
    user = await UserProvider.getByEmail(email, trx);
  } catch {
    // Silently ignore - don't reveal if email exists (security)
    return;
  }

  const token = uuidv4();
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);

  await UserProvider.updateToken(user.id_user, token, expires, trx);
  await sendForgotPasswordEmail(email, token);
};
