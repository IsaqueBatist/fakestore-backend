import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from "yup";
import { ProductService } from "../../services/products";
import { CACHE_TTL, PAGINATION_DEFAULTS } from "../../shared/constants";
import { RedisService } from "../../shared/services";
import { decodeCursor, decodeCompoundCursor, buildCursorResponse } from "../../shared/utils/cursor";

const VALID_SORTS = ["price_asc", "price_desc", "rating_desc", "newest", "name_asc"] as const;

const SORT_FIELD_MAP: Record<string, string> = {
  price_asc: "price",
  price_desc: "price",
  rating_desc: "rating",
  newest: "created_at",
  name_asc: "name",
};

interface IQueryProps {
  cursor?: string;
  limit?: number;
  filter?: string;
  search?: string;
  category_id?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  in_stock?: string;
  sort?: string;
}

export const getAllValidation = validation((getSchema) => ({
  query: getSchema<IQueryProps>(
    yup.object().shape({
      cursor: yup.string().optional(),
      limit: yup.number().optional().moreThan(0),
      filter: yup.string().optional(),
      search: yup.string().optional().min(2),
      category_id: yup.string().optional().matches(/^\d+(,\d+)*$/, "category_id must be comma-separated integers"),
      min_price: yup.number().optional().min(0),
      max_price: yup.number().optional().min(0),
      min_rating: yup.number().optional().min(0).max(5),
      in_stock: yup.string().optional().oneOf(["true", "false"]),
      sort: yup.string().optional().oneOf([...VALID_SORTS]),
    }),
  ),
}));

export const getAll = async (
  req: Request<{}, {}, {}, IQueryProps>,
  res: Response,
) => {
  const { filter, limit, cursor, search, category_id, min_price, max_price, min_rating, in_stock, sort } = req.query;
  const effectiveLimit = Number(limit) || PAGINATION_DEFAULTS.LIMIT;

  // Parse category_id string to number array
  const categoryIds = category_id
    ? category_id.split(",").map(Number)
    : undefined;

  // Decode cursor based on sort mode
  let afterCursor = 0;
  let cursorSortValue: string | undefined;

  if (cursor) {
    if (sort) {
      const decoded = decodeCompoundCursor(cursor);
      afterCursor = decoded.id;
      cursorSortValue = decoded.sortValue || undefined;
    } else {
      afterCursor = decodeCursor(cursor);
    }
  }

  // Build deterministic cache key (categoryIds sorted for consistency)
  const cacheKey = [
    `t:${req.tenant!.id}`,
    "products:all",
    `c:${afterCursor}`,
    `l:${effectiveLimit}`,
    `f:${filter || ""}`,
    `s:${search || ""}`,
    `cat:${categoryIds ? categoryIds.sort((a, b) => a - b).join(",") : ""}`,
    `minp:${min_price ?? ""}`,
    `maxp:${max_price ?? ""}`,
    `minr:${min_rating ?? ""}`,
    `stk:${in_stock ?? ""}`,
    `sort:${sort || ""}`,
  ].join(":");

  const cached = await RedisService.get(cacheKey);
  if (cached) return res.status(StatusCodes.OK).json(cached);

  const trx = await req.getTenantTrx!();
  const result = await ProductService.getAll(trx, {
    limit: effectiveLimit,
    afterCursor,
    filter: filter || undefined,
    search: search || undefined,
    categoryIds,
    minPrice: min_price !== undefined ? Number(min_price) : undefined,
    maxPrice: max_price !== undefined ? Number(max_price) : undefined,
    minRating: min_rating !== undefined ? Number(min_rating) : undefined,
    inStock: in_stock === "true" ? true : undefined,
    sort: sort || undefined,
    cursorSortValue,
  });

  // Use compound cursor when sorting, simple cursor for default order
  const sortField = sort ? SORT_FIELD_MAP[sort] : undefined;
  const response = buildCursorResponse(result, effectiveLimit, "id_product", sortField);

  await RedisService.set(cacheKey, response, CACHE_TTL.ONE_HOUR);

  return res.status(StatusCodes.OK).json(response);
};
