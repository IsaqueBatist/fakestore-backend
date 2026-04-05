import { AddressProvider } from "../../database/providers/addresses";
import { IAddress } from "../../database/models";
import type { Knex } from "knex";

export const updateById = async (
  trx: Knex.Transaction,
  addressId: number,
  newAddress: Omit<IAddress, "id_address" | "user_id">,
  userId: number,
): Promise<void> => {
  return await AddressProvider.updateById(addressId, newAddress, userId, trx);
};
