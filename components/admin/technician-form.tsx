"use client";

import { useActionState, useState } from "react";
import { createTechnicianAction, updateTechnicianAction } from "@/actions/admin/staff";
import { idleState } from "@/lib/admin/action-state";
import { specialtyOptions } from "@/lib/admin/specialties";

const field =
  "w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent-strong focus:outline-2 focus:outline-offset-0 focus:outline-accent/40";

type Initial = {
  userId?: string;
  fullName: string;
  phone: string;
  specialties: string[];
  notes: string;
  isActive: boolean;
};

const empty: Initial = { fullName: "", phone: "", specialties: [], notes: "", isActive: true };

const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function generatePassword(): string {
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  let password = Array.from(bytes, (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length]).join("");
  // Guarantee at least one letter and one digit (the server enforces the same rule).
  if (!/\d/.test(password)) password = `${password.slice(0, -1)}7`;
  if (!/[A-Za-z]/.test(password)) password = `K${password.slice(1)}`;
  return password;
}

export function TechnicianForm({ mode, initial = empty }: { mode: "create" | "edit"; initial?: Initial }) {
  const [state, formAction, pending] = useActionState(mode === "create" ? createTechnicianAction : updateTechnicianAction, idleState);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form key={state.nonce ?? 0} action={formAction} className="flex flex-col gap-4" autoComplete="off">
      {initial.userId && <input type="hidden" name="userId" value={initial.userId} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          نام و نام خانوادگی
          <input name="fullName" required minLength={2} maxLength={80} defaultValue={initial.fullName} disabled={pending} className={`${field} h-11`} />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          شمارهٔ موبایل
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            dir="ltr"
            required
            placeholder="09123456789"
            defaultValue={initial.phone}
            disabled={pending}
            className={`${field} h-11 text-start`}
          />
        </label>
      </div>

      {mode === "create" && (
        <fieldset className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
          <legend className="px-2 text-xs font-bold text-primary">اطلاعات ورود</legend>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
            ایمیل (شناسهٔ ورود)
            <input name="email" type="email" dir="ltr" required maxLength={254} autoComplete="off" disabled={pending} className={`${field} h-11 text-start`} />
          </label>

          <div className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
            <label htmlFor="technician-password">رمز عبور اولیه</label>
            <div className="flex gap-2">
              <input
                id="technician-password"
                name="password"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                required
                minLength={10}
                maxLength={72}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={pending}
                className={`${field} h-11 min-w-0 flex-1 text-start`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="h-11 shrink-0 rounded-xl border border-border px-3 text-xs font-semibold text-foreground hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-accent"
              >
                {showPassword ? "پنهان" : "نمایش"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setPassword(generatePassword());
                setShowPassword(true);
              }}
              disabled={pending}
              className="self-start text-xs font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-accent"
            >
              ساخت رمز تصادفی
            </button>
          </div>

          <p className="text-xs leading-6 text-muted sm:col-span-2">
            حداقل ۱۰ نویسه با حرف انگلیسی و عدد. رمز در هیچ جدول یا لاگی ذخیره نمی‌شود و فقط یک‌بار به Supabase Auth فرستاده می‌شود؛
            پیش از ثبت آن را کپی کنید و امن به تکنسین بدهید. ثبت‌نام عمومی غیرفعال می‌ماند.
          </p>
        </fieldset>
      )}

      <fieldset className="rounded-xl border border-border p-4">
        <legend className="px-2 text-xs font-bold text-primary">تخصص‌های فنی (حداقل یکی)</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {specialtyOptions.map((option) => (
            <label key={option.value} className="flex min-h-11 items-center gap-2.5 rounded-lg border border-border px-3 text-sm has-[:checked]:border-accent-strong has-[:checked]:bg-accent/10">
              <input
                type="checkbox"
                name="specialties"
                value={option.value}
                defaultChecked={initial.specialties.includes(option.value)}
                disabled={pending}
                className="size-4 accent-teal-700"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
        توضیحات (اختیاری)
        <textarea name="notes" rows={3} maxLength={1000} defaultValue={initial.notes} disabled={pending} className={`${field} py-2.5 leading-7`} />
      </label>

      {mode === "create" && (
        <label className="flex min-h-11 items-center gap-2.5 text-sm font-semibold">
          <input type="checkbox" name="isActive" defaultChecked={initial.isActive} disabled={pending} className="size-4 accent-teal-700" />
          حساب فعال باشد
        </label>
      )}

      <div aria-live="polite" className="min-h-5 text-sm">
        {state.status === "error" && <span role="alert" className="text-red-800">{state.message}</span>}
        {state.status === "success" && <span className="text-teal-800">{state.message}</span>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 sm:self-start"
      >
        {pending ? "در حال ثبت…" : mode === "create" ? "ساخت تکنسین" : "ذخیرهٔ تغییرات"}
      </button>
    </form>
  );
}
