import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IAddress } from "../../models/Addresses";
import { AppError, NotFoundError, DatabaseError } from "../../../errors";

export const getById = async (addressId: number): Promise<IAddress> => {
  try {
    const result = await Knex(EtableNames.addresses)
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
