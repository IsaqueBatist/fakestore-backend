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
): CursorPaginationResult<T> => {
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const lastItem = data[data.length - 1] as Record<string, unknown> | undefined;
  const nextCursor =
    hasMore && lastItem
      ? encodeCursor(Number(lastItem[idField]))
      : null;

  return {
    data,
    pagination: {
      next_cursor: nextCursor,
      has_more: hasMore,
    },
  };
};
