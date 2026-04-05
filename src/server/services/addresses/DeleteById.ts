import { AddressProvider } from "../../database/providers/addresses";

export const deleteById = async (addressId: number, userId: number): Promise<void> => {
  return await AddressProvider.deleteById(addressId, userId);
};
