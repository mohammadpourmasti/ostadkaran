import { applianceLabel, applianceOptions } from "./labels";
import { formatNumber } from "./format";

/**
 * Completion rate of a technician = completed / ALL of that technician's requests in the report set
 * (cancelled and still-open requests stay in the denominator; cancelled is never counted as completed).
 * Returns null when there are no requests, never NaN/Infinity.
 */
export function completionRate(completed: number, total: number): number | null {
  return total > 0 ? completed / total : null;
}

export function percentLabel(rate: number | null): string {
  return rate === null ? "—" : `${formatNumber(Math.round(rate * 100))}٪`;
}

/** Every known appliance (even with zero requests), plus "سایر" for keys that are not in the site's appliance list. */
export function applianceRows(items: { key: string; count: number }[]): { key: string; label: string; count: number }[] {
  const counts = new Map(items.map((item) => [item.key, item.count]));
  const known = applianceOptions.map((option) => ({ key: option.value, label: option.label, count: counts.get(option.value) ?? 0 }));
  const knownKeys = new Set(applianceOptions.map((option) => option.value));
  const other = items.filter((item) => !knownKeys.has(item.key)).reduce((sum, item) => sum + item.count, 0);
  const rows = [...known];
  if (other > 0 || !knownKeys.has("other")) rows.push({ key: "other-bucket", label: "سایر", count: other });
  return rows.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fa"));
}

export { applianceLabel };
