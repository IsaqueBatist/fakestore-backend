import { EtableNames } from "../../ETableNames";
import { IUser } from "../../models";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const getByEmail = async (
  userEmail: string,
  trx: KnexType.Transaction,
): Promise<IUser> => {
  try {
    const result = await trx(EtableNames.user)
      .select()
      .where("email", userEmail)
      .first();

    if (result) return result;

    throw new NotFoundError("errors:not_found", { resource: "User" });
  } catch (error) {
    logger.error({ err: error }, "Failed to get user by email");
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_getting", { resource: "user" });
  }
};
