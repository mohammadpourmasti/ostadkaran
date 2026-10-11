import { appliances } from "@/data/appliances";
import type { ApplianceId } from "@/types/appliance";

// Mirrors the CHECK constraints on public.repair_requests. The server is the source of truth;
// the client reuses this module only for instant feedback.
export const LIMITS = { name: { min: 2, max: 80 }, phone: { max: 20 }, problem: { min: 10, max: 1000 } } as const;

export type FieldName = "name" | "phone" | "appliance" | "problem";
export type FieldValues = Record<FieldName, string>;
export type FieldErrors = Partial<Record<FieldName, string>>;

export const fieldOrder: readonly FieldName[] = ["name", "phone", "appliance", "problem"];

const applianceIds: readonly string[] = appliances.map((appliance) => appliance.id);

// Persian (U+06F0..) and Arabic-Indic (U+0660..) digits to ASCII.
function toAsciiDigits(value: string) {
  return value
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
}

// Digits only, with a +98 / 0098 / 98 country prefix turned into the local leading 0.
export function normalizePhone(value: string) {
  const ascii = toAsciiDigits(value).replace(/[\s\-().\u200B-\u200F\u202A-\u202E\u2066-\u2069\u061C\uFEFF]/g, "");
  let digits = ascii.replace(/\D/g, "");
  if (ascii.startsWith("+") || digits.startsWith("00")) digits = digits.replace(/^(?:00)?98/, "0");
  else if (/^98\d{10}$/.test(digits)) digits = `0${digits.slice(2)}`;
  return digits;
}

// Mobile: 09xxxxxxxxx. Landline: 0 + area code (not 9) + 8 digits, e.g. 08634859005.
export function isValidIranianPhone(digits: string) {
  return /^09\d{9}$/.test(digits) || /^0[1-8]\d{9}$/.test(digits);
}

export function isApplianceId(value: string): value is ApplianceId {
  return applianceIds.includes(value);
}

// Length in code points, matching Postgres char_length rather than UTF-16 units.
function length(value: string) {
  return [...value].length;
}

// Control characters (incl. NUL, which Postgres rejects in text) are never legitimate input.
// The problem text may still contain tab / line breaks.
const CONTROL_IN_NAME = /[\u0000-\u001F\u007F-\u009F]/;
const CONTROL_IN_PROBLEM = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/;

export function validate(values: FieldValues): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  const problem = values.problem.trim();

  if (!name) errors.name = "نام و نام خانوادگی را وارد کنید.";
  else if (length(name) < LIMITS.name.min) errors.name = "نام باید دست‌کم ۲ حرف باشد.";
  else if (length(name) > LIMITS.name.max) errors.name = "نام نباید بیشتر از ۸۰ حرف باشد.";
  else if (CONTROL_IN_NAME.test(name)) errors.name = "نام شامل نویسه‌های نامعتبر است.";

  if (!values.phone.trim()) errors.phone = "شماره تماس را وارد کنید.";
  else if (!isValidIranianPhone(normalizePhone(values.phone))) {
    errors.phone = "شماره معتبر نیست. نمونه: ۰۹۱۲۳۴۵۶۷۸۹ یا ۰۸۶۳۴۸۵۹۰۰۵";
  }

  if (!isApplianceId(values.appliance)) errors.appliance = "نوع دستگاه را انتخاب کنید.";

  if (!problem) errors.problem = "مشکل دستگاه را توضیح دهید.";
  else if (length(problem) < LIMITS.problem.min) errors.problem = "توضیح کمی کوتاه است (دست‌کم ۱۰ حرف).";
  else if (length(problem) > LIMITS.problem.max) errors.problem = "توضیح نباید بیشتر از ۱۰۰۰ حرف باشد.";
  else if (CONTROL_IN_PROBLEM.test(problem)) errors.problem = "توضیح شامل نویسه‌های نامعتبر است.";

  return errors;
}
