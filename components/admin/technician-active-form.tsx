"use client";

import { useActionState } from "react";
import { setTechnicianActiveAction } from "@/actions/admin/staff";
import { idleState } from "@/lib/admin/action-state";
import { formatNumber } from "@/lib/admin/format";

type Props = { userId: string; isActive: boolean; openAssigned: number };

export function TechnicianActiveForm({ userId, isActive, openAssigned }: Props) {
  const [state, formAction, pending] = useActionState(setTechnicianActiveAction, idleState);
  const deactivating = isActive;

  return (
    <form key={`${isActive}-${state.nonce ?? 0}`} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="active" value={deactivating ? "false" : "true"} />
      <input type="hidden" name="openAssigned" value={openAssigned} />

      {deactivating ? (
        <>
          <p className="text-sm leading-7 text-muted">
            با غیرفعال‌کردن، تکنسین نمی‌تواند وارد شود یا مأموریت جدید بگیرد. سوابق، نام او در درخواست‌های قبلی و تاریخچهٔ تخصیص‌ها حفظ می‌شود.
          </p>
          {openAssigned > 0 && (
            <label className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
              <input type="checkbox" name="confirm" required disabled={pending} className="mt-1 size-4 accent-amber-700" />
              <span>
                هشدار: {formatNumber(openAssigned)} درخواست فعال به این تکنسین سپرده شده و بعد از غیرفعال‌شدن هم به نام او می‌ماند.
                باید آن‌ها را جداگانه به تکنسین دیگری بسپارید. مطلعم و ادامه می‌دهم.
              </span>
            </label>
          )}
        </>
      ) : (
        <p className="text-sm leading-7 text-muted">با فعال‌کردن، تکنسین دوباره در فهرست تخصیص ظاهر می‌شود و حساب ورودش باز می‌شود.</p>
      )}

      <div aria-live="polite" className="min-h-5 text-sm">
        {state.status === "error" && <span role="alert" className="text-red-800">{state.message}</span>}
        {state.status === "success" && <span className="text-teal-800">{state.message}</span>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${
          deactivating ? "border border-red-300 bg-surface text-red-800 hover:bg-red-50" : "bg-accent-strong text-white hover:brightness-110"
        }`}
      >
        {pending ? "در حال ثبت…" : deactivating ? "غیرفعال‌کردن تکنسین" : "فعال‌کردن تکنسین"}
      </button>
    </form>
  );
}
