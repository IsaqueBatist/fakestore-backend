import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { DatabaseError } from "../../../errors";

export const updateToken = async (
  id_user: number,
  token: string,
  expires: Date,
): Promise<void> => {
  try {
    await Knex(EtableNames.user)
      .update({ password_reset_token: token, password_reset_expires: expires })
      .where("id_user", "=", id_user);
  } catch (error) {
    console.error(error);
    throw new DatabaseError("Erro ao atualizar token de recuperação");
  }
};
