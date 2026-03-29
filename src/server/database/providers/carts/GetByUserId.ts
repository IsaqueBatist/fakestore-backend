import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICart } from "../../models";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const getByUserId = async (userId: number): Promise<ICart> => {
  try {
    const result = await Knex(EtableNames.cart)
      .select()
      .where("user_id", userId)
      .first();

    if (result) return result;

    throw new NotFoundError(`Cart`);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Database error while getting cart`);
  }
};
