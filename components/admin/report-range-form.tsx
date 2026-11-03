import Link from "next/link";
import { applianceOptions } from "@/lib/admin/labels";
import { REPORT_PRESETS, buildReportQuery, type ReportFilters } from "@/lib/admin/report-range";
import { REQUEST_STATUSES, statusLabels } from "@/lib/admin/statuses";
import type { TechnicianOption } from "@/lib/admin/repair-requests";

const field =
  "h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent-strong focus:outline-2 focus:outline-offset-0 focus:outline-accent/40";

// Presets are links that keep the other filters; the form applies technician/status/appliance and a custom range.
// Everything lives in the URL, so the report can be bookmarked, shared and exported with the same filters.
export function ReportFiltersForm({ filters, technicians }: { filters: ReportFilters; technicians: TechnicianOption[] }) {
  const custom = filters.range.key === "custom";
  const hasExtra = Boolean(filters.technician || filters.status || filters.appliance);

  return (
    <div className="mb-5 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <nav aria-label="بازهٔ گزارش" className="flex flex-wrap gap-2">
        {REPORT_PRESETS.map((preset) => {
          const active = filters.range.key === preset.key;
          return (
            <Link
              key={preset.key}
              href={`/admin/reports?${buildReportQuery(filters, { presetKey: preset.key })}`}
              aria-current={active ? "true" : undefined}
              className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                active ? "border-primary bg-primary text-white" : "border-border bg-surface text-foreground hover:bg-slate-50"
              }`}
            >
              {preset.label}
            </Link>
          );
        })}
        {custom && (
          <span aria-current="true" className="inline-flex h-10 items-center rounded-full border border-primary bg-primary px-4 text-sm font-semibold text-white">
            بازهٔ دلخواه
          </span>
        )}
      </nav>

      <form method="get" action="/admin/reports" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {!custom && <input type="hidden" name="range" value={filters.range.key} />}

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          تکنسین
          <select name="technician" defaultValue={filters.technician} className={field}>
            <option value="">همه</option>
            <option value="none">بدون تکنسین</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
                {technician.isActive ? "" : " (غیرفعال)"}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          وضعیت درخواست
          <select name="status" defaultValue={filters.status} className={field}>
            <option value="">همه</option>
            {REQUEST_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          نوع دستگاه
          <select name="appliance" defaultValue={filters.appliance} className={field}>
            <option value="">همه</option>
            {applianceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="hidden lg:block" aria-hidden="true" />

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          از تاریخ (بازهٔ دلخواه)
          <input type="date" name="from" defaultValue={custom ? filters.range.fromDay : ""} className={field} />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          تا تاریخ
          <input type="date" name="to" defaultValue={custom ? filters.range.toDay : ""} className={field} />
        </label>

        <div className="flex items-end gap-2 sm:col-span-2">
          <button
            type="submit"
            className="h-11 flex-1 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            اعمال فیلترها
          </button>
          {(hasExtra || custom) && (
            <Link
              href={`/admin/reports?range=${custom ? "30" : filters.range.key}`}
              className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold text-muted transition-colors hover:bg-slate-50"
            >
              پاک کردن
            </Link>
          )}
        </div>
      </form>
      <p className="mt-2 text-xs text-muted">برای بازهٔ دلخواه هر دو تاریخ را وارد کنید (حداکثر ۳۶۶ روز). تاریخ‌ها بر اساس روز ثبت درخواست و ساعت تهران‌اند.</p>
    </div>
  );
}
