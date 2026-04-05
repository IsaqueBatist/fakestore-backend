import { AddressProvider } from "../../database/providers/addresses";

export const count = async (filter?: string): Promise<number> => {
  return await AddressProvider.count(filter);
};
