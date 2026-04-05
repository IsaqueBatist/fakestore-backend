import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const updateToken = async (
  id_user: number,
  token: string,
  expires: Date,
  trx?: KnexType.Transaction,
): Promise<void> => {
  try {
    const conn = trx ?? Knex;
    await conn(EtableNames.user)
      .update({ password_reset_token: token, password_reset_expires: expires })
      .where("id_user", "=", id_user);
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_update_token");
  }
};
