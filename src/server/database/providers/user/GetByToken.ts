import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { IUser } from "../../models";
import type { Knex as KnexType } from "knex";

export const getByToken = async (token: string, trx: KnexType.Transaction): Promise<IUser> => {
  try {
    const result = await trx(EtableNames.user)
      .select()
      .where("password_reset_token", "=", token)
      .first();

    if (!result) {
      throw new NotFoundError("errors:not_found", { resource: "Token" });
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_getting", { resource: "token" });
  }
};
