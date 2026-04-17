import type { ApiListResponse, ApiMutationResponse } from "./contracts";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasDataField(value: unknown): value is { data: unknown } {
  if (!isObject(value)) {
    return false;
  }

  return "data" in value;
}

function hasItemsField(value: unknown): value is { items: unknown[] } {
  if (!isObject(value)) {
    return false;
  }

  return "items" in value && Array.isArray(value.items);
}

export function extractMutationData<TData>(raw: unknown): TData {
  if (hasDataField(raw)) {
    return raw.data as ApiMutationResponse<TData>["data"];
  }

  return raw as TData;
}

export function extractListItems<TItem>(raw: unknown): TItem[] {
  if (Array.isArray(raw)) {
    return raw as TItem[];
  }

  if (hasItemsField(raw)) {
    return raw.items as ApiListResponse<TItem>["items"];
  }

  return [];
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return fallback;
}

export function normalizeListResponse<TItem>(
  raw: unknown,
  defaultLimit = 10,
): ApiListResponse<TItem> {
  if (Array.isArray(raw)) {
    const length = raw.length;
    return {
      success: true,
      message: null,
      code: null,
      items: raw as TItem[],
      total: length,
      currentPage: 1,
      limit: length || defaultLimit,
      totalPages: length > 0 ? 1 : 0,
      hasNextPage: false,
    };
  }

  if (isObject(raw) && hasItemsField(raw)) {
    const rawRecord = raw as Record<string, unknown> & { items: unknown[] };
    const total = toNumber(rawRecord.total, rawRecord.items.length);
    const currentPage = toNumber(rawRecord.currentPage, 1);
    const limit = toNumber(rawRecord.limit, defaultLimit);
    const computedTotalPages = Math.ceil(total / Math.max(limit, 1));
    const totalPages = toNumber(rawRecord.totalPages, computedTotalPages);
    const hasNextPage =
      typeof rawRecord.hasNextPage === "boolean"
        ? rawRecord.hasNextPage
        : currentPage < totalPages;

    return {
      success:
        typeof rawRecord.success === "boolean" ? rawRecord.success : true,
      message: typeof rawRecord.message === "string" ? rawRecord.message : null,
      code: typeof rawRecord.code === "string" ? rawRecord.code : null,
      items: rawRecord.items as ApiListResponse<TItem>["items"],
      total,
      currentPage,
      limit,
      totalPages,
      hasNextPage,
    };
  }

  return {
    success: true,
    message: null,
    code: null,
    items: [],
    total: 0,
    currentPage: 1,
    limit: defaultLimit,
    totalPages: 0,
    hasNextPage: false,
  };
}
