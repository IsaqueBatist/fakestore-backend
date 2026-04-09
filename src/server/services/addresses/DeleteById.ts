import { AddressProvider } from "../../database/providers/addresses";
import type { Knex } from "knex";

export const deleteById = async (
  trx: Knex.Transaction,
  addressId: number,
  userId: number,
): Promise<void> => {
  return await AddressProvider.deleteById(addressId, userId, trx);
};
