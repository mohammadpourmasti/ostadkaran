import { statusLabels, type RequestStatus } from "@/lib/admin/statuses";

const tones: Record<RequestStatus, string> = {
  new: "bg-cta/15 text-amber-900 ring-cta/40",
  contacted: "bg-sky-50 text-sky-900 ring-sky-200",
  in_progress: "bg-primary/10 text-primary ring-primary/25",
  completed: "bg-accent/15 text-teal-900 ring-accent/40",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-300",
};

const dots: Record<RequestStatus, string> = {
  new: "bg-cta",
  contacted: "bg-sky-500",
  in_progress: "bg-primary",
  completed: "bg-accent-strong",
  cancelled: "bg-slate-400",
};

// Colour is never the only signal: the label is always shown.
export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${tones[status]}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dots[status]}`} />
      {statusLabels[status]}
    </span>
  );
}

export const statusDot = dots;
