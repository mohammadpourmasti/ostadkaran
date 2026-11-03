import Link from "next/link";
import { PAGE_SIZE, filtersToQuery, type RequestFilters } from "@/lib/admin/filters";
import { formatNumber } from "@/lib/admin/format";

export function Pagination({ filters, total }: { filters: RequestFilters; total: number }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  if (pages <= 1) return null;

  const href = (target: number) => `/admin/requests${filtersToQuery({ ...filters, page: target })}`;
  const link =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-accent";
  const disabled = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border px-4 text-sm text-muted/50";

  return (
    <nav aria-label="صفحه‌بندی" className="mt-5 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={link}>قبلی</Link>
      ) : (
        <span aria-disabled="true" className={disabled}>قبلی</span>
      )}
      <span className="text-sm text-muted">
        صفحهٔ {formatNumber(page)} از {formatNumber(pages)}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} rel="next" className={link}>بعدی</Link>
      ) : (
        <span aria-disabled="true" className={disabled}>بعدی</span>
      )}
    </nav>
  );
}
