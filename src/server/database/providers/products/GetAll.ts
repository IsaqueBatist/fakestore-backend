import { DatabaseError } from "../../../errors";
import { EtableNames } from "../../ETableNames";
import { IProduct } from "../../models";
import type { Knex as KnexType } from "knex";

export const getAll = async (
  limit: number,
  filter: string,
  afterCursor: number,
  trx: KnexType.Transaction,
): Promise<IProduct[]> => {
  try {
    const query = trx(EtableNames.products)
      .select()
      .orderBy("id_product", "asc")
      .limit(limit + 1); // Fetch one extra to detect if there are more pages

    if (afterCursor > 0) {
      query.where("id_product", ">", afterCursor);
    }

    if (filter) {
      query.andWhere("name", "like", `%${filter}%`);
    }

    return await query;
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_getting_all", { resource: "products" });
  }
};
