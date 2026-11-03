import Link from "next/link";
import { applianceOptions } from "@/lib/admin/labels";
import { REQUEST_STATUSES, statusLabels } from "@/lib/admin/statuses";
import type { TechnicianOption } from "@/lib/admin/repair-requests";
import type { RequestFilters } from "@/lib/admin/filters";
import { SearchIcon } from "./icons";

const field =
  "h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent-strong focus:outline-2 focus:outline-offset-0 focus:outline-accent/40";

// A plain GET form: filters live in the URL (shareable, survive going to a request and back) and work without JS.
export function RequestsFilters({ filters, technicians }: { filters: RequestFilters; technicians: TechnicianOption[] }) {
  const active = Boolean(filters.q || filters.status || filters.appliance || filters.technician || filters.from || filters.to || filters.sort !== "newest");

  return (
    <form method="get" action="/admin/requests" className="mb-5 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted sm:col-span-2">
          جست‌وجوی نام یا شماره تماس
          <span className="relative">
            <SearchIcon aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input type="search" name="q" defaultValue={filters.q} maxLength={64} placeholder="مثلاً علی یا ۰۹۱۲" className={`${field} ps-10`} />
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          وضعیت
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
          از تاریخ
          <input type="date" name="from" defaultValue={filters.from} className={field} />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          تا تاریخ
          <input type="date" name="to" defaultValue={filters.to} className={field} />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          مرتب‌سازی
          <select name="sort" defaultValue={filters.sort} className={field}>
            <option value="newest">جدیدترین</option>
            <option value="oldest">قدیمی‌ترین</option>
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="h-11 flex-1 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            اعمال
          </button>
          {active && (
            <Link
              href="/admin/requests"
              className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold text-muted transition-colors hover:bg-slate-50"
            >
              پاک کردن
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}
