"use client";

import { useActionState, useState } from "react";
import { changeStatusAction } from "@/actions/admin/requests";
import { idleState } from "@/lib/admin/action-state";
import { statusLabels, type RequestStatus } from "@/lib/admin/statuses";

const field =
  "w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent-strong focus:outline-2 focus:outline-offset-0 focus:outline-accent/40";

type Props = {
  requestId: string;
  currentStatus: RequestStatus;
  /** Only the changes this user's role may make (computed on the server; the database enforces it too). */
  options: RequestStatus[];
};

export function StatusForm({ requestId, currentStatus, options }: Props) {
  const [state, formAction, pending] = useActionState(changeStatusAction, idleState);
  const [selected, setSelected] = useState<RequestStatus | "">("");
  const cancelling = selected === "cancelled";

  if (options.length === 0) {
    return <p className="text-sm leading-7 text-muted">از این وضعیت، نقش شما امکان تغییر ندارد.</p>;
  }

  return (
    <form key={`${currentStatus}-${state.nonce ?? 0}`} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="expectedStatus" value={currentStatus} />

      <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
        وضعیت جدید
        <select
          name="newStatus"
          required
          value={selected}
          onChange={(event) => setSelected(event.target.value as RequestStatus | "")}
          disabled={pending}
          className={`${field} h-11`}
        >
          <option value="" disabled>
            انتخاب کنید…
          </option>
          {options.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </label>

      {cancelling && (
        <>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
            دلیل لغو (الزامی)
            <textarea name="reason" rows={3} minLength={3} maxLength={1000} required disabled={pending} className={`${field} py-2.5 leading-7`} />
          </label>
          <label className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-950">
            <input type="checkbox" name="confirmCancel" required disabled={pending} className="mt-1 size-4 accent-red-700" />
            می‌دانم که با لغو، این درخواست بسته می‌شود.
          </label>
        </>
      )}

      <div aria-live="polite" className="min-h-5 text-sm">
        {state.status === "error" && <span role="alert" className="text-red-800">{state.message}</span>}
        {state.status === "success" && <span className="text-teal-800">{state.message}</span>}
      </div>

      <button
        type="submit"
        disabled={pending || selected === ""}
        className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${
          cancelling ? "bg-red-700" : "bg-primary"
        }`}
      >
        {pending ? "در حال ثبت…" : cancelling ? "لغو درخواست" : "تغییر وضعیت"}
      </button>
    </form>
  );
}
