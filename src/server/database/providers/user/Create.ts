import { passwordCrypto } from "../../../shared/services";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IUser } from "../../models";
import { AppError, ConflictError, DatabaseError } from "../../../errors";

export const create = async (user: Omit<IUser, "id_user">): Promise<number> => {
  try {
    const hasedPassword = await passwordCrypto.hashPassowrd(user.password_hash);

    const busyEmail = await Knex(EtableNames.user)
      .select()
      .where("email", user.email)
      .first();

    if (busyEmail) throw new ConflictError("Email");

    const [result] = await Knex(EtableNames.user)
      .insert({ ...user, password_hash: hasedPassword })
      .returning("id_user");

    return Number(result.id_user);
  } catch (error) {
    //TODO: Adicionar monitoramento de log
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("Error registering record");
  }
};
