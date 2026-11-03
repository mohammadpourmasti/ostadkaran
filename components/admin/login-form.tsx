"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/actions/admin/auth";
import { idleState } from "@/lib/admin/action-state";
import { EyeIcon, EyeOffIcon } from "./icons";

const input =
  "h-12 w-full rounded-xl border border-border bg-surface px-3 text-base text-foreground transition-colors focus:border-accent-strong focus:outline-2 focus:outline-offset-0 focus:outline-accent/40";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, idleState);
  const [visible, setVisible] = useState(false);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
        ایمیل
        <input type="email" name="email" dir="ltr" autoComplete="username" required disabled={pending} className={`${input} text-start`} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
        رمز عبور
        <span className="relative">
          <input
            type={visible ? "text" : "password"}
            name="password"
            dir="ltr"
            autoComplete="current-password"
            required
            minLength={6}
            disabled={pending}
            className={`${input} pe-12 text-start`}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
            aria-pressed={visible}
            className="absolute end-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-accent"
          >
            {visible ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
          </button>
        </span>
      </label>

      <div aria-live="polite">
        {state.status === "error" && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-6 text-red-900">
            {state.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-base font-bold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "در حال ورود…" : "ورود به پنل"}
      </button>
    </form>
  );
}
