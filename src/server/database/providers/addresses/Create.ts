import { DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { IAddress } from "../../models/Addresses";
import type { Knex as KnexType } from "knex";

export const create = async (
  address: Omit<IAddress, "id_address" | "user_id">,
  user_id: number,
  trx: KnexType.Transaction,
): Promise<number> => {
  try {
    const [result] = await trx(EtableNames.addresses)
      .insert({ ...address, user_id })
      .returning("id_address");
    return Number(result.id_address);
  } catch (error) {
    //TODO: Adicionar monitoramento de log
    console.error(error);
    throw new DatabaseError("errors:db_error_registering");
  }
};
