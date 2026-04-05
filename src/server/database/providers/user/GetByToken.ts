import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IUser } from "../../models";

export const getByToken = async (token: string): Promise<IUser> => {
  try {
    const result = await Knex(EtableNames.user)
      .select()
      .where("password_reset_token", "=", token)
      .first();

    if (!result || !result.password_reset_expires) {
      throw new NotFoundError(
        "Invalid, non-existent, or malformed token in the database.",
      );
    }

    const now = new Date();
    const expirationDate = new Date(result.password_reset_expires);

    if (now > expirationDate) {
      throw new AppError("The token provided has expired.");
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new DatabaseError(
      `Infrastructure failure while retrieving token: ${(error as Error).message}`,
    );
  }
};
