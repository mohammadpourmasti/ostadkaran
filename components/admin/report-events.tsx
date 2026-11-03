import Link from "next/link";
import { formatDateTime } from "@/lib/admin/format";
import type { ReportEvent } from "@/lib/admin/repair-requests";
import { describeEvent } from "./assignment-history";

export function ReportEvents({ events }: { events: ReportEvent[] }) {
  if (events.length === 0) return <p className="py-6 text-center text-sm text-muted">در این بازه تغییری در مسئولیت‌ها ثبت نشده است.</p>;

  return (
    <ol className="divide-y divide-border">
      {events.map((event) => (
        <li key={event.id} className="py-3 text-sm">
          <p className="font-semibold text-foreground">{describeEvent(event)}</p>
          <p className="mt-0.5 text-xs text-muted">
            <Link href={`/admin/requests/${event.requestId}`} className="font-semibold text-primary hover:underline">
              {event.customerName || "درخواست"}
            </Link>
            {" · "}
            {formatDateTime(event.createdAt)}
            {event.actorName ? ` · ${event.actorName}` : ""}
          </p>
          {event.note && <p className="mt-1 break-words text-xs leading-6 text-foreground/80">{event.note}</p>}
        </li>
      ))}
    </ol>
  );
}
