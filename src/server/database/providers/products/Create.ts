import { DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IProduct } from "../../models";
import type { Knex as KnexType } from "knex";

export const create = async (
  product: Omit<IProduct, "id_product">,
  trx?: KnexType.Transaction,
): Promise<number | Error> => {
  try {
    const conn = trx ?? Knex;
    const [result] = await conn(EtableNames.products)
      .insert(product)
      .returning("id_product");
    return Number(result.id_product);
  } catch (error) {
    //TODO: Adicionar monitoramento de log
    console.error(error);
    throw new DatabaseError("errors:db_error_registering");
  }
};
