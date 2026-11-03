import { requireStaff } from "@/lib/admin/auth";
import { toCsv, tehranParts, type CsvCell } from "@/lib/admin/csv";
import { applianceLabel } from "@/lib/admin/labels";
import { completionRate } from "@/lib/admin/report-metrics";
import { parseReportFilters } from "@/lib/admin/report-range";
import { getExportRows, getReport } from "@/lib/admin/repair-requests";
import { statusLabels } from "@/lib/admin/statuses";

export const dynamic = "force-dynamic";

// CSV of the report's active filters. Requires a signed-in active manager/operator (requireStaff redirects
// anyone else), and contains no customer name, phone or problem text.
export async function GET(request: Request) {
  await requireStaff();

  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const filters = parseReportFilters(params);
  const kind = params.kind === "technicians" ? "technicians" : "requests";

  const headers = {
    "Content-Type": "text/csv; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "Content-Disposition": `attachment; filename="ostadkaran-${kind}-${filters.range.fromDay}_${filters.range.toDay}.csv"`,
  };

  let rows: CsvCell[][];

  if (kind === "requests") {
    const result = await getExportRows(filters);
    if (!result.ok) return new Response("خروجی در دسترس نیست.", { status: result.reason === "forbidden" ? 403 : 503 });

    rows = [
      ["تاریخ ثبت (میلادی)", "ساعت ثبت (تهران)", "تاریخ ثبت (شمسی)", "نوع دستگاه", "برند", "وضعیت", "تکنسین مسئول", "زمان تخصیص (میلادی)"],
      ...result.data.map((row) => {
        const created = tehranParts(row.createdAt);
        const assigned = tehranParts(row.assignedAt);
        return [
          created.date,
          created.time,
          created.persian,
          applianceLabel(row.appliance),
          row.brand,
          statusLabels[row.status],
          row.technicianName ?? "بدون تکنسین",
          assigned.date ? `${assigned.date} ${assigned.time}` : "",
        ];
      }),
    ];
  } else {
    const result = await getReport(filters);
    if (!result.ok) return new Response("خروجی در دسترس نیست.", { status: result.reason === "forbidden" ? 403 : 503 });

    const { technicians, unassigned } = result.data;
    rows = [
      ["تکنسین", "حساب فعال", "کل", "جدید", "تماس گرفته شده", "در حال انجام", "فعال", "تکمیل شده", "لغو شده", "درصد تکمیل (تکمیل ÷ کل)", "تخصیص‌های ثبت‌شده در بازه"],
      ...technicians.map((technician) => {
        const rate = completionRate(technician.completed, technician.total);
        return [
          technician.name,
          technician.isActive ? "بله" : "خیر",
          technician.total,
          technician.new,
          technician.contacted,
          technician.inProgress,
          technician.active,
          technician.completed,
          technician.cancelled,
          rate === null ? "" : Math.round(rate * 1000) / 10,
          technician.assignmentsMade,
        ];
      }),
      ["بدون تکنسین", "", unassigned, "", "", "", "", "", "", "", ""],
    ];
  }

  return new Response(toCsv(rows), { headers });
}
