import { EtableNames } from "../../ETableNames";
import { IAddress } from "../../models/Addresses";
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  DatabaseError,
} from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const updateById = async (
  addressId: number,
  newAddress: Omit<IAddress, "id_address" | "user_id">,
  userId: number,
  trx: KnexType.Transaction,
): Promise<void> => {
  try {
    const address = await trx(EtableNames.addresses)
      .select()
      .where("id_address", addressId)
      .first();

    if (!address)
      throw new NotFoundError("errors:not_found", { resource: "Address" });

    if (Number(address.user_id) !== userId)
      throw new ForbiddenError("errors:forbidden_action", {
        action: "modify",
        resource: "address",
      });

    const updatedRows = await trx(EtableNames.addresses)
      .where("id_address", addressId)
      .update(newAddress);

    if (updatedRows > 0) return;

    throw new DatabaseError("errors:db_error_updating", {
      resource: "address",
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to update address by id");
    if (error instanceof AppError) throw error;
    throw new DatabaseError("errors:db_error_updating", {
      resource: "address",
    });
  }
};
