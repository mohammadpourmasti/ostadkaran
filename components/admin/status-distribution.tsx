import { formatNumber } from "@/lib/admin/format";
import { REQUEST_STATUSES, statusLabels, type RequestStatus } from "@/lib/admin/statuses";
import { statusDot } from "./status-badge";

export function StatusDistribution({ counts, total }: { counts: Record<RequestStatus, number>; total: number }) {
  if (total === 0) return <p className="py-6 text-center text-sm text-muted">هنوز درخواستی ثبت نشده است.</p>;

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100" role="img" aria-label="توزیع درخواست‌ها بر اساس وضعیت">
        {REQUEST_STATUSES.map((status) =>
          counts[status] > 0 ? (
            <span key={status} className={statusDot[status]} style={{ width: `${(counts[status] / total) * 100}%` }} />
          ) : null,
        )}
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {REQUEST_STATUSES.map((status) => (
          <li key={status} className="flex items-center gap-2 text-sm">
            <span aria-hidden="true" className={`size-2.5 rounded-full ${statusDot[status]}`} />
            <span className="flex-1 text-muted">{statusLabels[status]}</span>
            <span className="font-bold tabular-nums">{formatNumber(counts[status])}</span>
            <span className="w-10 text-end text-xs tabular-nums text-muted">
              {formatNumber(Math.round((counts[status] / total) * 100))}٪
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
