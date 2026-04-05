import { AddressProvider } from "../../database/providers/addresses";
import { IAddress } from "../../database/models";
import type { Knex } from "knex";

export const getById = async (trx: Knex.Transaction, addressId: number): Promise<IAddress> => {
  return await AddressProvider.getById(addressId, trx);
};
