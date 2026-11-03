import { formatDateTime } from "@/lib/admin/format";
import type { TimelineEntry } from "@/lib/admin/repair-requests";
import { kindLabels, statusLabels } from "@/lib/admin/statuses";

const kindTone: Record<TimelineEntry["kind"], string> = {
  note: "bg-slate-400",
  call_attempt: "bg-cta",
  call_success: "bg-accent-strong",
  status_change: "bg-primary",
};

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="py-4 text-sm text-muted">هنوز یادداشت یا تغییر وضعیتی ثبت نشده است.</p>;
  }

  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => (
        <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
          {index < entries.length - 1 && <span aria-hidden="true" className="absolute inset-y-4 start-[0.3125rem] w-px bg-border" />}
          <span aria-hidden="true" className={`relative mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-surface ${kindTone[entry.kind]}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">
              {kindLabels[entry.kind]}
              {entry.kind === "status_change" && entry.oldStatus && entry.newStatus && (
                <span className="font-semibold text-muted">
                  {" "}
                  · {statusLabels[entry.oldStatus]} ← {statusLabels[entry.newStatus]}
                </span>
              )}
            </p>
            {entry.body && <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-7 text-foreground/85">{entry.body}</p>}
            <p className="mt-1 text-xs text-muted">
              {entry.authorName ?? "کاربر حذف‌شده"} · {formatDateTime(entry.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
