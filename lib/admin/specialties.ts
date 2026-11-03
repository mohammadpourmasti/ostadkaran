import { applianceOptions } from "./labels";

// Specialties are the same appliance ids the public site and the requests use (including "other"), so a request's
// appliance can be matched to technicians with a plain comparison.
export const specialtyOptions = applianceOptions;

const labels = new Map(applianceOptions.map((option) => [option.value, option.label]));

export function isSpecialty(value: unknown): value is string {
  return typeof value === "string" && labels.has(value);
}

export function specialtyLabel(id: string): string {
  return labels.get(id) ?? id;
}

export function specialtyLabels(ids: readonly string[]): string {
  return ids.length ? ids.map(specialtyLabel).join("، ") : "ثبت نشده";
}
