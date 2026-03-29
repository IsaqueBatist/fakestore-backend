import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IUser } from "../../models";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const getByEmail = async (userEmail: string): Promise<IUser> => {
  try {
    const result = await Knex(EtableNames.user)
      .select()
      .where("email", userEmail)
      .first();

    if (result) return result;

    throw new NotFoundError(`User`);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(
      `Database error while getting user with email ${userEmail}`,
    );
  }
};
