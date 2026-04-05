import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IAddress } from "../../models/Addresses";
import { DatabaseError } from "../../../errors";

export const getAll = async (
  page: number,
  limit: number,
  filter: string,
  id = 0,
): Promise<IAddress[]> => {
  try {
    const result = await Knex(EtableNames.addresses)
      .select()
      .where("id_address", Number(id))
      .orWhere("city", "like", `%${filter}%`)
      .offset((page - 1) * limit)
      .limit(limit);

    if (
      id > 0 &&
      result.every((item) => Number(item.id_address) !== Number(id))
    ) {
      const resultById = await Knex(EtableNames.addresses)
        .select()
        .where("id_address", id)
        .first();

      if (resultById) return [...result, resultById];
    }
    return result;
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_getting_all", { resource: "addresses" });
  }
};
