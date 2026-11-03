import { formatNumber } from "@/lib/admin/format";

export function ReportBars({ items, total, empty }: { items: { label: string; count: number }[]; total: number; empty: string }) {
  if (items.length === 0 || total === 0) return <p className="py-6 text-center text-sm text-muted">{empty}</p>;
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-semibold text-foreground">{item.label}</span>
            <span className="shrink-0 tabular-nums text-muted">
              <span className="font-bold text-foreground">{formatNumber(item.count)}</span>
              {" · "}
              {formatNumber(Math.round((item.count / total) * 100))}٪
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
