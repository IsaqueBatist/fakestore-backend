import { EtableNames } from "../../ETableNames";
import { ICategory } from "../../models";
import { DatabaseError } from "../../../errors";
import type { Knex as KnexType } from "knex";

export const getAll = async (
  limit: number,
  filter: string,
  afterCursor: number,
  trx: KnexType.Transaction,
): Promise<ICategory[]> => {
  try {
    const query = trx(EtableNames.categories)
      .select()
      .orderBy("id_category", "asc")
      .limit(limit + 1);

    if (afterCursor > 0) {
      query.where("id_category", ">", afterCursor);
    }

    if (filter) {
      query.andWhere("name", "like", `%${filter}%`);
    }

    return await query;
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_getting_all", {
      resource: "categories",
    });
  }
};
