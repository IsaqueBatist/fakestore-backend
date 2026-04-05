import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  DatabaseError,
} from "../../../errors";

export const deleteById = async (
  addressId: number,
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

    await Knex(EtableNames.addresses).where("id_address", addressId).del();

    return;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_deleting", { resource: "address" });
  }
};
