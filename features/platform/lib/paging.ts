export type PlatformSearchParams = Promise<Record<string, string | string[] | undefined>>;

export const PLATFORM_PAGE_SIZE = 50;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Page number from `?page=`; anything that is not a positive whole number is page 1. */
export function pageFrom(params: Record<string, string | string[] | undefined>) {
  const raw = first(params.page) ?? "";
  const page = /^\d+$/.test(raw) ? Number(raw) : 1;
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

/** Value of `key` only when it is in `allowed`. */
export function allowedParam<T extends string>(params: Record<string, string | string[] | undefined>, key: string, allowed: readonly T[]): T | undefined {
  const value = first(params[key]);
  return allowed.find((candidate) => candidate === value);
}

export function hrefWith(path: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "" && !(key === "page" && value === 1)) query.set(key, String(value));
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}
