// CSV for Excel: UTF-8 with BOM (Persian text shows correctly), CRLF lines, quoting, and protection against
// spreadsheet formula injection (a cell starting with = + - @ would run as a formula).

export type CsvCell = string | number | null | undefined;

const BOM = "﻿";

function cell(value: CsvCell): string {
  if (value === null || value === undefined) return "";
  let text = typeof value === "number" ? String(value) : value;
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: CsvCell[][]): string {
  return BOM + rows.map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}

const persianLatinDigits = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tehran",
});

/** "yyyy-mm-dd" and "HH:mm" in Asia/Tehran (fixed +03:30), plus the Persian date with Latin digits. */
export function tehranParts(iso: string | null): { date: string; time: string; persian: string } {
  if (!iso) return { date: "", time: "", persian: "" };
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return { date: "", time: "", persian: "" };
  const local = new Date(ms + 3.5 * 60 * 60 * 1000).toISOString();
  return { date: local.slice(0, 10), time: local.slice(11, 16), persian: persianLatinDigits.format(new Date(ms)) };
}
