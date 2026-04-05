import { AddressProvider } from "../../database/providers/addresses";
import { IAddress } from "../../database/models";

export const getAll = async (
  page: number,
  limit: number,
  filter: string,
  id?: number,
): Promise<IAddress[]> => {
  return await AddressProvider.getAll(page, limit, filter, id);
};
