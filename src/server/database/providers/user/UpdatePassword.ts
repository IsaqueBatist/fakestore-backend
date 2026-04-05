import { Knex } from "../../knex";
import { EtableNames } from "../../ETableNames";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const updatePassword = async (
  id_user: number,
  new_password: string,
  trx?: KnexType.Transaction,
): Promise<void> => {
  try {
    const conn = trx ?? Knex;
    await conn(EtableNames.user)
      .update({
        password_hash: new_password,
        password_reset_expires: null,
        password_reset_token: null,
      })
      .where("id_user", "=", id_user);
  } catch (error) {
    throw new DatabaseError("errors:db_error_update_password");
  }
};
