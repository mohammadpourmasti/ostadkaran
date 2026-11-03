import { formatNumber } from "@/lib/admin/format";
import type { ReportTechnician } from "@/lib/admin/repair-requests";

// One stacked bar per technician, on a shared scale so the lengths compare directly. No chart library.
export function TechnicianCompare({ technicians }: { technicians: ReportTechnician[] }) {
  const visible = technicians.filter((technician) => technician.total > 0);
  if (visible.length === 0) return <p className="py-6 text-center text-sm text-muted">در این بازه مأموریتی به تکنسینی تخصیص نیافته است.</p>;

  const max = Math.max(1, ...visible.map((technician) => technician.total));

  return (
    <div>
      <ul className="space-y-4">
        {visible.map((technician) => (
          <li key={technician.id}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-foreground">{technician.name}</span>
              <span className="shrink-0 font-bold tabular-nums">{formatNumber(technician.total)}</span>
            </div>
            <div
              className="flex h-3 overflow-hidden rounded-full bg-slate-100"
              role="img"
              aria-label={`${technician.name}: ${formatNumber(technician.completed)} تکمیل، ${formatNumber(technician.active)} فعال، ${formatNumber(technician.cancelled)} لغو`}
              style={{ width: `${(technician.total / max) * 100}%`, minWidth: "0.75rem" }}
            >
              <span className="bg-accent-strong" style={{ width: `${(technician.completed / technician.total) * 100}%` }} />
              <span className="bg-primary" style={{ width: `${(technician.active / technician.total) * 100}%` }} />
              <span className="bg-slate-400" style={{ width: `${(technician.cancelled / technician.total) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-full bg-accent-strong" />تکمیل‌شده</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />فعال (جدید، تماس‌گرفته، در حال انجام)</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-full bg-slate-400" />لغوشده</li>
      </ul>
    </div>
  );
}
