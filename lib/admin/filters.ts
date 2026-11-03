import { REQUEST_STATUSES, isRequestStatus, type RequestStatus } from "./statuses";

export const PAGE_SIZE = 20;
const MAX_PAGE = 1000;
const MAX_TERM = 64;

export type RequestSort = "newest" | "oldest";

export type RequestFilters = {
  q: string;
  status: RequestStatus | "";
  appliance: string;
  /** "" = everyone, "none" = unassigned, otherwise a technician's user id. */
  technician: string;
  /** yyyy-mm-dd (Asia/Tehran calendar day), inclusive. */
  from: string;
  /** yyyy-mm-dd (Asia/Tehran calendar day), inclusive. */
  to: string;
  sort: RequestSort;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const APPLIANCE_ID = /^[a-z][a-z-]{0,39}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

function validDay(value: string): string {
  if (!ISO_DAY.test(value)) return "";
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? "" : value;
}

/** Turns URL search params into safe, normalised filters. Anything invalid is dropped, never trusted. */
export function parseRequestFilters(params: RawParams): RequestFilters {
  const status = first(params.status);
  const appliance = first(params.appliance);
  const technician = first(params.technician);
  const page = Number.parseInt(toLatinDigits(first(params.page)), 10);

  return {
    q: toLatinDigits(first(params.q)).replace(/\s+/g, " ").trim().slice(0, MAX_TERM),
    status: isRequestStatus(status) ? status : "",
    appliance: APPLIANCE_ID.test(appliance) ? appliance : "",
    technician: technician === "none" || UUID_PATTERN.test(technician) ? technician.toLowerCase() : "",
    from: validDay(first(params.from)),
    to: validDay(first(params.to)),
    sort: first(params.sort) === "oldest" ? "oldest" : "newest",
    page: Number.isFinite(page) && page >= 1 ? Math.min(page, MAX_PAGE) : 1,
  };
}

// Iran has no daylight saving time since 2022, so +03:30 is a fixed offset.
const TEHRAN_OFFSET = "+03:30";

export function dayStartIso(day: string): string | null {
  return day ? new Date(`${day}T00:00:00${TEHRAN_OFFSET}`).toISOString() : null;
}

/** Exclusive upper bound: the start of the day AFTER `day`. */
export function dayEndExclusiveIso(day: string): string | null {
  if (!day) return null;
  return new Date(new Date(`${day}T00:00:00${TEHRAN_OFFSET}`).getTime() + 24 * 60 * 60 * 1000).toISOString();
}

/** Query string for a list URL; empty values are omitted so URLs stay short and stable. */
export function filtersToQuery(filters: Partial<RequestFilters>): string {
  const query = new URLSearchParams();
  if (filters.q) query.set("q", filters.q);
  if (filters.status) query.set("status", filters.status);
  if (filters.appliance) query.set("appliance", filters.appliance);
  if (filters.technician) query.set("technician", filters.technician);
  if (filters.from) query.set("from", filters.from);
  if (filters.to) query.set("to", filters.to);
  if (filters.sort && filters.sort !== "newest") query.set("sort", filters.sort);
  if (filters.page && filters.page > 1) query.set("page", String(filters.page));
  const text = query.toString();
  return text ? `?${text}` : "";
}

export { REQUEST_STATUSES };
