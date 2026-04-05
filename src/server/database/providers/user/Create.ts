import { EtableNames } from "../../ETableNames";
import { IUser } from "../../models";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const create = async (
  user: Omit<IUser, "id_user">,
  trx: KnexType.Transaction,
): Promise<number> => {
  try {
    const [result] = await trx(EtableNames.user)
      .insert(user)
      .returning("id_user");

    return Number(result.id_user);
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_registering");
  }
};
