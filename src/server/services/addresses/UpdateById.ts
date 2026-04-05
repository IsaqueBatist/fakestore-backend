import { AddressProvider } from "../../database/providers/addresses";
import { IAddress } from "../../database/models";

export const updateById = async (
  addressId: number,
  newAddress: Omit<IAddress, "id_address" | "user_id">,
  userId: number,
): Promise<void> => {
  return await AddressProvider.updateById(addressId, newAddress, userId);
};
