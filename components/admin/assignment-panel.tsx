"use client";

import { useActionState } from "react";
import { assignTechnicianAction } from "@/actions/admin/requests";
import { idleState } from "@/lib/admin/action-state";
import { formatDateTime } from "@/lib/admin/format";
import type { CurrentAssignment, TechnicianOption } from "@/lib/admin/repair-requests";
import { specialtyLabels } from "@/lib/admin/specialties";

const field =
  "w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent-strong focus:outline-2 focus:outline-offset-0 focus:outline-accent/40";

type Props = {
  requestId: string;
  /** The request's appliance id: technicians whose specialties include it are listed first and marked. */
  appliance: string;
  current: CurrentAssignment | null;
  technicians: TechnicianOption[];
  /** Only managers may remove an assignment (also enforced by the database). */
  canUnassign: boolean;
  /** Completed/cancelled requests keep their technician (also enforced by the database). */
  closed: boolean;
};

export function AssignmentPanel({ requestId, appliance, current, technicians, canUnassign, closed }: Props) {
  const [state, formAction, pending] = useActionState(assignTechnicianAction, idleState);
  const options = technicians
    .filter((technician) => technician.id !== current?.technicianId)
    .map((technician) => ({ ...technician, match: technician.specialties.includes(appliance) }))
    .sort((a, b) => Number(b.match) - Number(a.match));

  return (
    <div className="flex flex-col gap-3">
      {current ? (
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="flex flex-wrap items-center gap-2 font-bold text-foreground">
            {current.technicianName}
            <span
              className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${
                current.technicianActive ? "bg-accent/15 text-teal-900" : "bg-slate-200 text-slate-700"
              }`}
            >
              {current.technicianActive ? "فعال" : "غیرفعال"}
            </span>
          </p>
          <p className="mt-1 text-xs leading-6 text-muted">
            از {formatDateTime(current.assignedAt)}
            {current.assignedByName ? ` · تخصیص‌دهنده: ${current.assignedByName}` : ""}
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-cta/60 bg-cta/10 p-3 text-sm font-semibold text-amber-950">بدون تکنسین</p>
      )}

      {closed ? (
        <p className="text-sm leading-7 text-muted">این درخواست بسته شده است؛ تکنسین مسئول آن دیگر قابل تغییر نیست.</p>
      ) : technicians.length === 0 && !current ? (
        <p className="text-sm leading-7 text-muted">هنوز تکنسین فعالی تعریف نشده است. راهنما: supabase/admin-dashboard-setup.md</p>
      ) : (
        <form key={`${current?.technicianId ?? "none"}-${state.nonce ?? 0}`} action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="requestId" value={requestId} />

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
            {current ? "تکنسین جدید" : "انتخاب تکنسین"}
            <select name="technicianId" defaultValue="" disabled={pending} className={`${field} h-11`}>
              <option value="" disabled>
                انتخاب کنید…
              </option>
              {options.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.match ? "✓ " : ""}
                  {technician.name}
                  {technician.specialties.length ? ` — ${specialtyLabels(technician.specialties)}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
            توضیح (اختیاری)
            <textarea name="note" rows={2} maxLength={500} disabled={pending} className={`${field} py-2.5 leading-7`} />
          </label>

          <div aria-live="polite" className="min-h-5 text-sm">
            {state.status === "error" && <span role="alert" className="text-red-800">{state.message}</span>}
            {state.status === "success" && <span className="text-teal-800">{state.message}</span>}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              name="intent"
              value="assign"
              disabled={pending || options.length === 0}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "در حال ثبت…" : current ? "تغییر تکنسین" : "تخصیص تکنسین"}
            </button>
            {current && canUnassign && (
              <button
                type="submit"
                name="intent"
                value="unassign"
                formNoValidate
                disabled={pending}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-red-300 bg-surface px-5 text-sm font-bold text-red-800 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                لغو تخصیص
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
