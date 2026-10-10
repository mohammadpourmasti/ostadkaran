"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { appliances } from "@/data/appliances";
import type { ApplianceId } from "@/types/appliance";

/*
 * Frontend-only form. Online submission is NOT connected to any backend yet:
 * submitting only runs client-side validation and shows a notice. Nothing is
 * sent, stored or simulated. When the secure server-side flow exists, replace
 * the preventDefault in `handleSubmit` with the real action and drop the notice
 * in the page.
 */
const LIMITS = { name: { min: 2, max: 80 }, phone: { max: 20 }, problem: { min: 10, max: 1000 } } as const;

const baseFieldClass =
  "mt-1.5 block w-full rounded-xl border bg-surface px-3.5 py-2.5 text-base text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-offset-1 focus:outline-accent/40";

type FieldName = "name" | "phone" | "appliance" | "problem";
type Errors = Partial<Record<FieldName, string>>;

const fieldOrder: readonly FieldName[] = ["name", "phone", "appliance", "problem"];
const applianceIds: readonly string[] = appliances.map((appliance) => appliance.id);

// Persian (U+06F0..) and Arabic-Indic (U+0660..) digits to ASCII.
function toAsciiDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
}

// Digits only, with a +98 / 0098 / 98 country prefix turned into the local leading 0.
function normalizePhone(value: string) {
  const ascii = toAsciiDigits(value).replace(/[\s\-().‎‏‌]/g, "");
  let digits = ascii.replace(/\D/g, "");
  if (ascii.startsWith("+") || digits.startsWith("00")) digits = digits.replace(/^(?:00)?98/, "0");
  else if (/^98\d{10}$/.test(digits)) digits = `0${digits.slice(2)}`;
  return digits;
}

// Mobile: 09xxxxxxxxx. Landline: 0 + area code (not 9) + 8 digits, e.g. 08634859005.
function isValidIranianPhone(digits: string) {
  return /^09\d{9}$/.test(digits) || /^0[1-8]\d{9}$/.test(digits);
}

function validate(values: Record<FieldName, string>): Errors {
  const errors: Errors = {};
  const name = values.name.trim();
  const problem = values.problem.trim();

  if (!name) errors.name = "نام و نام خانوادگی را وارد کنید.";
  else if (name.length < LIMITS.name.min) errors.name = "نام باید دست‌کم ۲ حرف باشد.";

  if (!values.phone.trim()) errors.phone = "شماره تماس را وارد کنید.";
  else if (!isValidIranianPhone(normalizePhone(values.phone))) {
    errors.phone = "شماره معتبر نیست. نمونه: ۰۹۱۲۳۴۵۶۷۸۹ یا ۰۸۶۳۴۸۵۹۰۰۵";
  }

  if (!applianceIds.includes(values.appliance)) errors.appliance = "نوع دستگاه را انتخاب کنید.";

  if (!problem) errors.problem = "مشکل دستگاه را توضیح دهید.";
  else if (problem.length < LIMITS.problem.min) errors.problem = "توضیح کمی کوتاه است (دست‌کم ۱۰ حرف).";

  return errors;
}

function Field({
  id,
  label,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
        <span aria-hidden="true" className="ms-1 text-cta">
          *
        </span>
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm/6 text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function RepairRequestForm({ defaultAppliance }: { defaultAppliance?: ApplianceId }) {
  const [errors, setErrors] = useState<Errors>({});
  const [checked, setChecked] = useState(false);

  function fieldProps(name: FieldName) {
    const invalid = Boolean(errors[name]);
    return {
      id: `rr-${name}`,
      name,
      required: true,
      "aria-required": true as const,
      "aria-invalid": invalid,
      "aria-describedby": invalid ? `rr-${name}-error` : undefined,
      className: `${baseFieldClass} ${invalid ? "border-red-600" : "border-border"}`,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Always prevented: there is no backend to submit to yet.
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      appliance: String(data.get("appliance") ?? ""),
      problem: String(data.get("problem") ?? ""),
    };
    const next = validate(values);
    setErrors(next);
    setChecked(Object.keys(next).length === 0);

    const first = fieldOrder.find((field) => next[field]);
    if (first) form.querySelector<HTMLElement>(`#rr-${first}`)?.focus();
  }

  const phoneProps = fieldProps("phone");

  return (
    <form
      noValidate
      aria-describedby="form-status"
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border bg-surface p-5 sm:p-7"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <p className="text-xs text-muted sm:col-span-2">
          <span aria-hidden="true" className="text-cta">
            *
          </span>{" "}
          موارد ستاره‌دار الزامی است.
        </p>

        <Field id="rr-name" label="نام و نام خانوادگی" error={errors.name}>
          <input
            {...fieldProps("name")}
            type="text"
            autoComplete="name"
            minLength={LIMITS.name.min}
            maxLength={LIMITS.name.max}
          />
        </Field>

        <Field id="rr-phone" label="شماره تماس" error={errors.phone}>
          <input
            {...phoneProps}
            type="tel"
            dir="ltr"
            inputMode="tel"
            autoComplete="tel"
            maxLength={LIMITS.phone.max}
            placeholder="09123456789"
            className={`${phoneProps.className} text-right`}
            onBlur={(event) => {
              // Show ASCII digits once the number is plausible; leave anything else for the user to fix.
              const digits = normalizePhone(event.currentTarget.value);
              if (isValidIranianPhone(digits)) event.currentTarget.value = digits;
            }}
          />
        </Field>

        <Field id="rr-appliance" label="نوع دستگاه" error={errors.appliance} className="sm:col-span-2">
          <select {...fieldProps("appliance")} defaultValue={defaultAppliance ?? ""}>
            <option value="" disabled>
              انتخاب کنید
            </option>
            {appliances.map((appliance) => (
              <option key={appliance.id} value={appliance.id}>
                {appliance.title}
              </option>
            ))}
          </select>
        </Field>

        <Field id="rr-problem" label="مشکل دستگاه" error={errors.problem} className="sm:col-span-2">
          <textarea {...fieldProps("problem")} rows={4} minLength={LIMITS.problem.min} maxLength={LIMITS.problem.max} />
        </Field>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl border-[1.5px] border-accent-strong bg-surface px-6 text-[0.9375rem] font-semibold text-primary transition-colors hover:bg-accent/5 sm:w-auto sm:min-w-52"
          >
            بررسی اطلاعات
          </button>
          <p role="status" className="mt-3 text-sm/7 text-foreground empty:hidden">
            {checked &&
              "اطلاعات واردشده معتبر است، اما ثبت آنلاین هنوز فعال نیست و چیزی ارسال یا ذخیره نشد. لطفاً برای ثبت درخواست تماس بگیرید."}
          </p>
        </div>
      </div>
    </form>
  );
}
