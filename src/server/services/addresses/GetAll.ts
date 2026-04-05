import { AddressProvider } from "../../database/providers/addresses";
import { IAddress } from "../../database/models";
import type { Knex } from "knex";

export const getAll = async (
  trx: Knex.Transaction,
  page: number,
  limit: number,
  filter: string,
  id?: number,
): Promise<IAddress[]> => {
  return await AddressProvider.getAll(page, limit, filter, id, trx);
};
