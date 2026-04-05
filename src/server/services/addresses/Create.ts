import { AddressProvider } from "../../database/providers/addresses";
import { IAddress } from "../../database/models";

export const create = async (
  address: Omit<IAddress, "id_address" | "user_id">,
  userId: number,
): Promise<number> => {
  return await AddressProvider.create(address, userId);
};
