"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { submitRepairRequest, type RepairRequestState } from "@/actions/submit-repair-request";
import { appliances } from "@/data/appliances";
import {
  LIMITS,
  fieldOrder,
  isValidIranianPhone,
  normalizePhone,
  type FieldName,
  type FieldValues,
} from "@/lib/repair-request/validation";
import type { ApplianceId } from "@/types/appliance";

/*
 * Submission runs through the `submitRepairRequest` Server Action, which validates every field again
 * on the server and stores the request. Success is shown only after the insert is confirmed; on any
 * error the submitted values are kept in the form.
 */
const baseFieldClass =
  "mt-1.5 block w-full rounded-xl border bg-surface px-3.5 py-2.5 text-base text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-offset-1 focus:outline-accent/40";

const initialState: RepairRequestState = { status: "idle" };

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
  const [state, formAction, pending] = useActionState(submitRepairRequest, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  // When the form was shown; sent with each submission so the server can enforce a minimum fill time.
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const errors = state.status === "error" ? state.errors : {};
  const values: Partial<FieldValues> = state.status === "error" ? state.values : {};

  // Move focus to the first invalid field after a failed submission.
  useEffect(() => {
    if (state.status !== "error") return;
    const first = fieldOrder.find((field) => state.errors[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`#rr-${first}`)?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-3xl border border-accent/40 bg-accent/[0.06] p-5 sm:p-7">
        <h2 className="text-lg/8 font-bold text-foreground">درخواست شما ثبت شد</h2>
        <p className="mt-1 text-sm/7 text-foreground">
          درخواست تعمیر شما با موفقیت ثبت شد. به‌زودی با شما تماس می‌گیریم.
        </p>
      </div>
    );
  }

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

  const phoneProps = fieldProps("phone");

  return (
    <form
      ref={formRef}
      noValidate
      action={(formData) => {
        formData.set("startedAt", String(startedAt.current));
        return formAction(formData);
      }}
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
            defaultValue={values.name}
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
            defaultValue={values.phone}
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
          <select {...fieldProps("appliance")} defaultValue={values.appliance || defaultAppliance || ""}>
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
          <textarea {...fieldProps("problem")} rows={4} defaultValue={values.problem} maxLength={LIMITS.problem.max} />
        </Field>

        {/* Honeypot: hidden from sight, assistive tech and keyboard; bots that fill it are ignored server-side. */}
        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
          <label>
            وب‌سایت
            <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl border-[1.5px] border-accent-strong bg-surface px-6 text-[0.9375rem] font-semibold text-primary transition-colors hover:bg-accent/5 disabled:opacity-60 sm:w-auto sm:min-w-52"
          >
            {pending ? "در حال ثبت…" : "ثبت درخواست"}
          </button>
          <p role="status" className="mt-3 text-sm/7 text-red-700 empty:hidden">
            {state.status === "error" ? state.message : null}
          </p>
        </div>
      </div>
    </form>
  );
}
