import { AddressProvider } from "../../database/providers/addresses";
import { IAddress } from "../../database/models";

export const getById = async (addressId: number): Promise<IAddress> => {
  return await AddressProvider.getById(addressId);
};
