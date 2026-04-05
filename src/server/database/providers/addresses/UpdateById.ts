import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IAddress } from "../../models/Addresses";
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  DatabaseError,
} from "../../../errors";

export const updateById = async (
  addressId: number,
  newAddress: Omit<IAddress, "id_address" | "user_id">,
  userId: number,
): Promise<void> => {
  try {
    const address = await Knex(EtableNames.addresses)
      .select()
      .where("id_address", addressId)
      .first();

    if (!address) throw new NotFoundError("errors:not_found", { resource: "Address" });

    if (Number(address.user_id) !== userId)
      throw new ForbiddenError("errors:forbidden_action", { action: "modify", resource: "address" });

    const updatedRows = await Knex(EtableNames.addresses)
      .where("id_address", addressId)
      .update(newAddress);

    if (updatedRows > 0) return;

    throw new DatabaseError("errors:db_error_updating", { resource: "address" });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_updating", { resource: "address" });
  }
};
