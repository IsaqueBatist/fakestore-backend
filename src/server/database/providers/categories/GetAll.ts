import { EtableNames } from "../../ETableNames";
import { ICategory } from "../../models";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const getAll = async (
  page: number,
  limit: number,
  filter: string,
  id = 0,
  trx: KnexType.Transaction,
): Promise<ICategory[]> => {
  try {
    const result = await trx(EtableNames.categories)
      .select()
      .where("id_category", Number(id))
      .orWhere("name", "like", `%${filter}%`)
      .offset((page - 1) * limit)
      .limit(limit);

    if (
      id > 0 &&
      result.every((item) => Number(item.id_category) !== Number(id))
    ) {
      const resultById = await trx(EtableNames.categories)
        .select()
        .where("id_category", id)
        .first();

      if (resultById) return [...result, resultById];
    }
    return result;
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_getting_all", { resource: "categories" });
  }
};
