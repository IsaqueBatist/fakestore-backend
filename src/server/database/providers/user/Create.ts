import { passwordCrypto } from "../../../shared/services";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IUser } from "../../models";
import { AppError, BadRequestError, DatabaseError } from "../../../errors";

export const create = async (user: Omit<IUser, "id_user">): Promise<number> => {
  try {
    const hashedPassword = await passwordCrypto.hashPassword(user.password_hash);

    const busyEmail = await Knex(EtableNames.user)
      .select()
      .where("email", user.email)
      .first();

    if (busyEmail) throw new BadRequestError("errors:email_already_registered");

    const [result] = await Knex(EtableNames.user)
      .insert({ ...user, password_hash: hashedPassword })
      .returning("id_user");

    return Number(result.id_user);
  } catch (error) {
    //TODO: Adicionar monitoramento de log
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_registering");
  }
};
