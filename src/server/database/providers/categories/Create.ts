import { DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { ICategory } from "../../models";
import type { Knex as KnexType } from "knex";

export const create = async (
  category: Omit<ICategory, "id_category">,
  trx: KnexType.Transaction,
): Promise<number | Error> => {
  try {
    const [result] = await trx(EtableNames.categories)
      .insert(category)
      .returning("id_category");
    return Number(result.id_category);
  } catch (error) {
    //TODO: Adicionar monitoramento de log
    console.error(error);
    throw new DatabaseError("errors:db_error_registering");
  }
};
