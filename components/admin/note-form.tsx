"use client";

import { useActionState } from "react";
import { addNoteAction } from "@/actions/admin/requests";
import { idleState } from "@/lib/admin/action-state";
import { NOTE_KINDS, kindLabels } from "@/lib/admin/statuses";

const field =
  "w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent-strong focus:outline-2 focus:outline-offset-0 focus:outline-accent/40";

export function NoteForm({ requestId }: { requestId: string }) {
  const [state, formAction, pending] = useActionState(addNoteAction, idleState);

  return (
    // The key changes after each successful save, which clears the fields without any effect.
    <form key={state.nonce ?? 0} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="requestId" value={requestId} />

      <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
        نوع یادداشت
        <select name="kind" defaultValue="note" disabled={pending} className={`${field} h-11`}>
          {NOTE_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kindLabels[kind]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
        متن
        <textarea name="body" rows={3} maxLength={1000} required disabled={pending} className={`${field} py-2.5 leading-7`} />
      </label>

      <div aria-live="polite" className="min-h-5 text-sm">
        {state.status === "error" && <span role="alert" className="text-red-800">{state.message}</span>}
        {state.status === "success" && <span className="text-teal-800">{state.message}</span>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "در حال ثبت…" : "ثبت یادداشت"}
      </button>
    </form>
  );
}
