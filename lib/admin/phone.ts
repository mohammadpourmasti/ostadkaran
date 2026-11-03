// Iranian mobile numbers, normalised to the local form 09xxxxxxxxx. Pure; safe on server and client.

function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/** "+98 912 345 6789", "۰۹۱۲۳۴۵۶۷۸۹", "0098912…" -> "09123456789"; null when it is not a valid mobile number. */
export function normalizeIranMobile(input: string): string | null {
  let digits = toLatinDigits(input).replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("0098")) digits = digits.slice(4);
  else if (digits.startsWith("98") && digits.length === 12) digits = digits.slice(2);
  if (/^9\d{9}$/.test(digits)) digits = `0${digits}`;
  return /^09\d{9}$/.test(digits) ? digits : null;
}

/** 09123456789 -> 0912***6789 (for logs and the SMS outbox: never the full number). */
export function maskPhone(phone: string): string {
  return /^09\d{9}$/.test(phone) ? `${phone.slice(0, 4)}***${phone.slice(7)}` : "***";
}
