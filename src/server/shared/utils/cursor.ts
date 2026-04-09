/**
 * Cursor-based pagination utilities.
 *
 * Cursors are base64-encoded IDs that point to the last item seen.
 * This is more efficient than offset-based pagination for large datasets
 * and avoids issues with data shifting between pages.
 */

export const encodeCursor = (id: number): string => {
  return Buffer.from(`cursor:${id}`).toString("base64");
};

export const decodeCursor = (cursor: string): number => {
  const decoded = Buffer.from(cursor, "base64").toString("utf-8");
  const id = Number(decoded.replace("cursor:", ""));
  if (isNaN(id)) return 0;
  return id;
};

/**
 * Compound cursor for sorted pagination.
 * Encodes both the sort column value and the tiebreaker id to handle duplicate sort values.
 */
export const encodeCompoundCursor = (sortValue: string | number, id: number): string => {
  return Buffer.from(`ccursor:${sortValue}:${id}`).toString("base64");
};

export const decodeCompoundCursor = (cursor: string): { sortValue: string; id: number } => {
  const decoded = Buffer.from(cursor, "base64").toString("utf-8");
  if (!decoded.startsWith("ccursor:")) {
    // Fallback: simple cursor, extract id only
    const id = Number(decoded.replace("cursor:", ""));
    return { sortValue: "", id: isNaN(id) ? 0 : id };
  }
  const withoutPrefix = decoded.slice("ccursor:".length);
  const lastColon = withoutPrefix.lastIndexOf(":");
  const sortValue = withoutPrefix.slice(0, lastColon);
  const id = Number(withoutPrefix.slice(lastColon + 1));
  return { sortValue, id: isNaN(id) ? 0 : id };
};

export interface CursorPaginationResult<T> {
  data: T[];
  pagination: {
    next_cursor: string | null;
    has_more: boolean;
  };
}

/**
 * Build a cursor-paginated response from a query result.
 * The query should fetch limit + 1 items. If we get more than `limit`,
 * there are more pages. The extra item is excluded from the response.
 */
export const buildCursorResponse = <T>(
  results: T[],
  limit: number,
  idField: string,
  sortField?: string,
): CursorPaginationResult<T> => {
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const lastItem = data[data.length - 1] as Record<string, unknown> | undefined;

  let nextCursor: string | null = null;
  if (hasMore && lastItem) {
    if (sortField) {
      nextCursor = encodeCompoundCursor(
        String(lastItem[sortField]),
        Number(lastItem[idField]),
      );
    } else {
      nextCursor = encodeCursor(Number(lastItem[idField]));
    }
  }

  return {
    data,
    pagination: {
      next_cursor: nextCursor,
      has_more: hasMore,
    },
  };
};
