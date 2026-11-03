// Display helpers (Persian calendar, Tehran time). Pure and safe for server and client.

const dateTime = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Tehran",
});

const dateOnly = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  month: "short",
  day: "numeric",
  timeZone: "Asia/Tehran",
});

const monthOnly = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  timeZone: "Asia/Tehran",
});

const number = new Intl.NumberFormat("fa-IR");

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateTime.format(date);
}

/** "2026-10-30" -> short Persian day label. */
export function formatDay(day: string): string {
  const date = new Date(`${day}T12:00:00+03:30`);
  return Number.isNaN(date.getTime()) ? day : dateOnly.format(date);
}

export function formatNumber(value: number): string {
  return number.format(value);
}

/** Coarse "how long ago" in Persian: دقیقه / ساعت / روز. */
export function formatAge(iso: string, now: number = Date.now()): string {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "—";
  const minutes = Math.max(0, Math.floor((now - time) / 60000));
  if (minutes < 1) return "همین الان";
  if (minutes < 60) return `${formatNumber(minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${formatNumber(hours)} ساعت پیش`;
  return `${formatNumber(Math.floor(hours / 24))} روز پیش`;
}

/** tel: link from an Iranian local number such as 09123456789 or 0863xxxxxxx. */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.startsWith("0") ? `tel:+98${digits.slice(1)}` : `tel:${digits}`;
}

/** Hours -> short Persian duration: دقیقه / ساعت / روز. */
export function formatDuration(hours: number | null): string {
  if (hours === null || !Number.isFinite(hours)) return "—";
  if (hours < 1) return `${formatNumber(Math.max(1, Math.round(hours * 60)))} دقیقه`;
  if (hours < 48) return `${formatNumber(Math.round(hours * 10) / 10)} ساعت`;
  return `${formatNumber(Math.round((hours / 24) * 10) / 10)} روز`;
}

export function formatPercent(part: number, whole: number): string {
  return whole > 0 ? `${formatNumber(Math.round((part / whole) * 100))}٪` : "—";
}

/** Short Persian month label for a "yyyy-mm-dd" first-of-month bucket. */
export function formatMonth(day: string): string {
  const date = new Date(`${day}T12:00:00+03:30`);
  return Number.isNaN(date.getTime()) ? day : monthOnly.format(date);
}
