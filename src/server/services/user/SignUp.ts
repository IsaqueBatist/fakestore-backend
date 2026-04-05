import { Knex } from "../../database/knex";
import { UserProvider } from "../../database/providers/user";
import { CartProvider } from "../../database/providers/carts";
import { passwordCrypto } from "../../shared/services";
import { BadRequestError } from "../../errors";
import { IUser } from "../../database/models";

export const signUp = async (user: Omit<IUser, "id_user">): Promise<number> => {
  const hashedPassword = await passwordCrypto.hashPassword(user.password_hash);

  return await Knex.transaction(async (trx) => {
    let existingUser = null;
    try {
      existingUser = await UserProvider.getByEmail(user.email, trx);
    } catch {
      // User not found - this is the expected case
    }

    if (existingUser) throw new BadRequestError("errors:email_already_registered");

    const userId = await UserProvider.create(
      { ...user, password_hash: hashedPassword },
      trx,
    );

    await CartProvider.createCart(userId, trx);

    return userId;
  });
};
