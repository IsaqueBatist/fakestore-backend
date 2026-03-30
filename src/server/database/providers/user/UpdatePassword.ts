import { Knex } from "../../knex";
import { EtableNames } from "../../ETableNames";
import { DatabaseError } from "../../../errors";

export const updatePassword = async (
  id_user: number,
  new_password: string,
): Promise<void> => {
  try {
    await Knex(EtableNames.user)
      .update({
        password_hash: new_password,
        password_reset_expires: null,
        password_reset_token: null,
      })
      .where("id_user", "=", id_user);
  } catch (error) {
    throw new DatabaseError(
      "Error while updating password and invalidating token",
    );
  }
};
