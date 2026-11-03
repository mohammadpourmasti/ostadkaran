import { formatDateTime } from "@/lib/admin/format";
import type { AssignmentEvent } from "@/lib/admin/repair-requests";

export function describeEvent(event: Pick<AssignmentEvent, "fromId" | "fromName" | "toId" | "toName">): string {
  if (event.toId && !event.fromId) return `تخصیص به ${event.toName ?? "—"}`;
  if (!event.toId && event.fromId) return `برداشتن تخصیص از ${event.fromName ?? "—"}`;
  return `تغییر از ${event.fromName ?? "—"} به ${event.toName ?? "—"}`;
}

export function AssignmentHistory({ events }: { events: AssignmentEvent[] }) {
  if (events.length === 0) return <p className="text-sm text-muted">هنوز تخصیصی ثبت نشده است.</p>;

  return (
    <ol className="flex flex-col gap-3">
      {events.map((event) => (
        <li key={event.id} className="border-s-2 border-border ps-3 text-sm">
          <p className="font-semibold text-foreground">{describeEvent(event)}</p>
          <p className="text-xs text-muted">
            {formatDateTime(event.createdAt)}
            {event.actorName ? ` · ${event.actorName}` : ""}
          </p>
          {event.note && <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-6 text-foreground/80">{event.note}</p>}
        </li>
      ))}
    </ol>
  );
}
