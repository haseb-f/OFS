import type { CursorPaginationRequest, OffsetPaginationRequest } from '@ofs/types';

export function buildCursorWhere(cursor: string | undefined): { id?: { gt: string } } {
  if (!cursor) return {};
  return { id: { gt: cursor } };
}

export function buildOffsetSkipTake(req: OffsetPaginationRequest): {
  skip: number;
  take: number;
} {
  return {
    skip: (req.page - 1) * req.pageSize,
    take: req.pageSize,
  };
}

export function buildCursorSkipTake(req: CursorPaginationRequest): {
  skip: number;
  take: number;
  cursor?: { id: string };
} {
  return {
    skip: req.cursor ? 1 : 0,
    take: req.limit + 1, // fetch one extra to determine hasMore
    ...(req.cursor ? { cursor: { id: req.cursor } } : {}),
  };
}

export function buildCursorResponse<T extends { id: string }>(
  rows: T[],
  limit: number
): { data: T[]; nextCursor: string | null; hasMore: boolean } {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const lastItem = data[data.length - 1];
  return {
    data,
    nextCursor: hasMore && lastItem ? lastItem.id : null,
    hasMore,
  };
}

export function calcTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}
