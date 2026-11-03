import Link from "next/link";
import { formatAge } from "@/lib/admin/format";
import type { ActivityEntry } from "@/lib/admin/repair-requests";
import { kindLabels, statusLabels } from "@/lib/admin/statuses";

export function ActivityList({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) return <p className="py-4 text-sm text-muted">فعالیتی ثبت نشده است.</p>;

  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => (
        <li key={entry.id}>
          <Link href={`/admin/requests/${entry.requestId}`} className="block py-3 transition-colors hover:bg-primary/[0.03] focus-visible:outline-2 focus-visible:outline-accent">
            <span className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-bold text-foreground">
                {kindLabels[entry.kind]} · {entry.customerName}
              </span>
              <span className="shrink-0 text-xs text-muted">{formatAge(entry.createdAt)}</span>
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted">
              {entry.kind === "status_change" && entry.oldStatus && entry.newStatus
                ? `${statusLabels[entry.oldStatus]} ← ${statusLabels[entry.newStatus]}`
                : (entry.body ?? "")}
              {entry.authorName ? ` — ${entry.authorName}` : ""}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
