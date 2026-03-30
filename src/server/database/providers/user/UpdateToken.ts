import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const updateToken = async (
  id_user: number,
  token: string,
  expires: Date,
): Promise<void | Error> => {
  try {
    await Knex(EtableNames.user)
      .update({ password_reset_token: token, password_reset_expires: expires })
      .where("id_user", "=", id_user);
  } catch (error) {
    return new Error("Erro ao atualizar token de recuperação");
  }
};
