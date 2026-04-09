import { EtableNames } from "../../ETableNames";
import { IAddress } from "../../models/Addresses";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const getById = async (
  addressId: number,
  trx: KnexType.Transaction,
): Promise<IAddress> => {
  try {
    const result = await trx(EtableNames.addresses)
      .select()
      .where("id_address", addressId)
      .first();

    if (result) return result;

    throw new NotFoundError("errors:not_found", { resource: "Address" });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_getting", { resource: "address" });
  }
};
