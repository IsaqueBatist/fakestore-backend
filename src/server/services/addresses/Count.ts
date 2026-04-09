import { AddressProvider } from "../../database/providers/addresses";
import type { Knex } from "knex";

export const count = async (
  trx: Knex.Transaction,
  filter?: string,
): Promise<number> => {
  return await AddressProvider.count(filter, trx);
};
