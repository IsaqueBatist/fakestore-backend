import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import { EtableNames } from "../../ETableNames";
import { IProduct } from "../../models";
import type { Knex as KnexType } from "knex";

export interface IGetAllOptions {
  limit: number;
  afterCursor: number;
  filter?: string;
  search?: string;
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sort?: string;
  cursorSortValue?: string;
}

const SORT_CONFIG: Record<
  string,
  { column: string; direction: "asc" | "desc" }
> = {
  price_asc: { column: "price", direction: "asc" },
  price_desc: { column: "price", direction: "desc" },
  rating_desc: { column: "rating", direction: "desc" },
  newest: { column: "created_at", direction: "desc" },
  name_asc: { column: "name", direction: "asc" },
};

export const getAll = async (
  options: IGetAllOptions,
  trx: KnexType.Transaction,
): Promise<IProduct[]> => {
  try {
    const {
      limit,
      afterCursor,
      filter,
      search,
      categoryIds,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sort,
      cursorSortValue,
    } = options;

    const tbl = EtableNames.products;
    const query = trx(tbl).select(`${tbl}.*`);

    // --- CATEGORY JOIN (only when filtering by category) ---
    if (categoryIds && categoryIds.length > 0) {
      query
        .join(
          EtableNames.product_categories,
          `${tbl}.id_product`,
          `${EtableNames.product_categories}.product_id`,
        )
        .whereIn(`${EtableNames.product_categories}.category_id`, categoryIds)
        .groupBy(`${tbl}.id_product`);
    }

    // --- BACKWARD COMPAT: name LIKE ---
    if (filter) {
      query.andWhere(`${tbl}.name`, "like", `%${filter}%`);
    }

    // --- FULL-TEXT SEARCH ---
    if (search) {
      query.whereRaw(
        `${tbl}.search_vector @@ websearch_to_tsquery('pg_catalog.english', ?)`,
        [search],
      );
    }

    // --- PRICE RANGE ---
    if (minPrice !== undefined) {
      query.andWhere(`${tbl}.price`, ">=", minPrice);
    }
    if (maxPrice !== undefined) {
      query.andWhere(`${tbl}.price`, "<=", maxPrice);
    }

    // --- RATING ---
    if (minRating !== undefined) {
      query.andWhere(`${tbl}.rating`, ">=", minRating);
    }

    // --- STOCK ---
    if (inStock === true) {
      query.andWhere(`${tbl}.stock`, ">", 0);
    }

    // --- SORT + CURSOR PAGINATION ---
    const cfg = sort ? SORT_CONFIG[sort] : undefined;

    if (!cfg) {
      // Default: ORDER BY id_product ASC with simple cursor
      query.orderBy(`${tbl}.id_product`, "asc");
      if (afterCursor > 0) {
        query.where(`${tbl}.id_product`, ">", afterCursor);
      }
    } else {
      // Custom sort with compound cursor (sort_value + id tiebreaker)
      query.orderBy(`${tbl}.${cfg.column}`, cfg.direction);
      query.orderBy(`${tbl}.id_product`, "asc");

      if (afterCursor > 0 && cursorSortValue !== undefined) {
        const op = cfg.direction === "asc" ? ">" : "<";
        query.where(function () {
          this.where(`${tbl}.${cfg.column}`, op, cursorSortValue).orWhere(
            function () {
              this.where(`${tbl}.${cfg.column}`, "=", cursorSortValue).andWhere(
                `${tbl}.id_product`,
                ">",
                afterCursor,
              );
            },
          );
        });
      }
    }

    query.limit(limit + 1);

    return await query;
  } catch (error) {
    logger.error({ err: error }, "Failed to get all products");
    throw new DatabaseError("errors:db_error_getting_all", {
      resource: "products",
    });
  }
};
