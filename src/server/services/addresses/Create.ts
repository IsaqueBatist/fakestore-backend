import { AddressProvider } from "../../database/providers/addresses";
import { IAddress } from "../../database/models";
import type { Knex } from "knex";

export const create = async (
  trx: Knex.Transaction,
  address: Omit<IAddress, "id_address" | "user_id">,
  userId: number,
): Promise<number> => {
  return await AddressProvider.create(address, userId, trx);
};
