import { EtableNames } from "../../ETableNames";
import { IAddress } from "../../models/Addresses";
import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

export const getAll = async (
  page: number,
  limit: number,
  filter: string,
  id = 0,
  trx: KnexType.Transaction,
): Promise<IAddress[]> => {
  try {
    const result = await trx(EtableNames.addresses)
      .select()
      .where("id_address", Number(id))
      .orWhere("city", "like", `%${filter}%`)
      .offset((page - 1) * limit)
      .limit(limit);

    if (
      id > 0 &&
      result.every((item) => Number(item.id_address) !== Number(id))
    ) {
      const resultById = await trx(EtableNames.addresses)
        .select()
        .where("id_address", id)
        .first();

      if (resultById) return [...result, resultById];
    }
    return result;
  } catch (error) {
    logger.error({ err: error }, "Failed to get all addresses");
    throw new DatabaseError("errors:db_error_getting_all", {
      resource: "addresses",
    });
  }
};
