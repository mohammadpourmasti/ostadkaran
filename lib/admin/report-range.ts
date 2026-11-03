import { dayEndExclusiveIso, dayStartIso, parseRequestFilters } from "./filters";
import type { RequestStatus } from "./statuses";

export const REPORT_PRESETS = [
  { key: "today", label: "امروز" },
  { key: "yesterday", label: "دیروز" },
  { key: "7", label: "۷ روز اخیر" },
  { key: "30", label: "۳۰ روز اخیر" },
  { key: "month", label: "ماه جاری" },
  { key: "prev-month", label: "ماه قبل" },
] as const;

export type ReportRange = {
  /** A preset key, or "custom". */
  key: string;
  /** yyyy-mm-dd, inclusive (Asia/Tehran calendar day). */
  fromDay: string;
  toDay: string;
  fromIso: string;
  /** Exclusive upper bound. */
  toIso: string;
};

export type ReportFilters = {
  range: ReportRange;
  /** "" = everyone, "none" = unassigned, otherwise a technician's user id. */
  technician: string;
  status: RequestStatus | "";
  appliance: string;
};

type RawParams = Record<string, string | string[] | undefined>;

const DAY_MS = 24 * 60 * 60 * 1000;
const TEHRAN_OFFSET_MS = 3.5 * 60 * 60 * 1000;
const MAX_SPAN_DAYS = 366;

// Iran has no daylight saving time, so +03:30 is a fixed offset.
const jalaliDay = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", { day: "numeric", timeZone: "Asia/Tehran" });

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function tehranToday(now: number = Date.now()): string {
  return new Date(now + TEHRAN_OFFSET_MS).toISOString().slice(0, 10);
}

export function shiftDay(day: string, delta: number): string {
  return new Date(new Date(`${day}T00:00:00Z`).getTime() + delta * DAY_MS).toISOString().slice(0, 10);
}

/** Day of the Persian (Jalali) month for a Gregorian "yyyy-mm-dd" day, via Intl. */
function jalaliDayOfMonth(day: string): number {
  return Number(jalaliDay.format(new Date(`${day}T12:00:00+03:30`)));
}

/** Current Persian month up to today (offset 0) or the whole previous Persian month (offset -1). */
export function jalaliMonthRange(today: string, offset: 0 | -1): { from: string; to: string } {
  const currentStart = shiftDay(today, -(jalaliDayOfMonth(today) - 1));
  if (offset === 0) return { from: currentStart, to: today };
  const previousEnd = shiftDay(currentStart, -1);
  return { from: shiftDay(previousEnd, -(jalaliDayOfMonth(previousEnd) - 1)), to: previousEnd };
}

function build(key: string, fromDay: string, toDay: string): ReportRange {
  return { key, fromDay, toDay, fromIso: dayStartIso(fromDay)!, toIso: dayEndExclusiveIso(toDay)! };
}

function presetRange(key: string, today: string): ReportRange | null {
  switch (key) {
    case "today":
      return build(key, today, today);
    case "yesterday":
      return build(key, shiftDay(today, -1), shiftDay(today, -1));
    case "7":
      return build(key, shiftDay(today, -6), today);
    case "30":
      return build(key, shiftDay(today, -29), today);
    case "month": {
      const range = jalaliMonthRange(today, 0);
      return build(key, range.from, range.to);
    }
    case "prev-month": {
      const range = jalaliMonthRange(today, -1);
      return build(key, range.from, range.to);
    }
    default:
      return null;
  }
}

/** Safe report filters from URL params. A preset, or a validated custom from/to (max 366 days); anything invalid is dropped. */
export function parseReportFilters(params: RawParams, now: number = Date.now()): ReportFilters {
  const today = tehranToday(now);
  const parsed = parseRequestFilters({
    from: params.from,
    to: params.to,
    status: params.status,
    appliance: params.appliance,
    technician: params.technician,
  });

  let range: ReportRange | null = null;

  if (parsed.from && parsed.to && parsed.from <= parsed.to) {
    const span = (new Date(`${parsed.to}T00:00:00Z`).getTime() - new Date(`${parsed.from}T00:00:00Z`).getTime()) / DAY_MS + 1;
    if (span <= MAX_SPAN_DAYS) range = build("custom", parsed.from, parsed.to);
  }

  range ??= presetRange(first(params.range), today) ?? presetRange("30", today)!;

  return { range, technician: parsed.technician, status: parsed.status, appliance: parsed.appliance };
}

/**
 * Query string (no leading "?") for report URLs. `presetKey` swaps the range for that preset while keeping the
 * other filters; `extra` adds fixed params such as the export kind.
 */
export function buildReportQuery(filters: ReportFilters, options: { presetKey?: string; extra?: Record<string, string> } = {}): string {
  const query = new URLSearchParams();
  if (options.presetKey) {
    query.set("range", options.presetKey);
  } else if (filters.range.key === "custom") {
    query.set("from", filters.range.fromDay);
    query.set("to", filters.range.toDay);
  } else {
    query.set("range", filters.range.key);
  }
  if (filters.technician) query.set("technician", filters.technician);
  if (filters.status) query.set("status", filters.status);
  if (filters.appliance) query.set("appliance", filters.appliance);
  for (const [key, value] of Object.entries(options.extra ?? {})) query.set(key, value);
  return query.toString();
}
