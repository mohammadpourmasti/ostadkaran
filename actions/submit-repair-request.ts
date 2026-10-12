"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { fieldOrder, normalizePhone, validate, type FieldErrors, type FieldValues } from "@/lib/repair-request/validation";

export type RepairRequestState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message?: string; errors: FieldErrors; values: FieldValues };

const TOO_FAST_ERROR = "ارسال فرم خیلی سریع انجام شد. لطفاً چند ثانیه صبر کنید و دوباره تلاش کنید.";
const GENERIC_ERROR = "ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید یا با ما تماس بگیرید.";
const RATE_LIMITED_ERROR = "تعداد درخواست‌های مجاز برای این شماره تلفن در یک ساعت اخیر تکمیل شده است. لطفاً کمی بعد دوباره تلاش کنید.";

// Spam protection (no CAPTCHA / IP rate limiting): a hidden honeypot field and a minimum fill time.
const HONEYPOT_FIELD = "website";
const STARTED_AT_FIELD = "startedAt";
const MIN_FILL_MS = 3_000;
const MAX_FILL_MS = 24 * 60 * 60 * 1000;

function readValues(formData: FormData): FieldValues {
  const values = {} as FieldValues;
  for (const field of fieldOrder) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value : "";
  }
  return values;
}

export async function submitRepairRequest(
  _previous: RepairRequestState,
  formData: FormData,
): Promise<RepairRequestState> {
  // Honeypot: real users never see this field. Report success without inserting, so bots get no signal.
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") return { status: "success" };

  const values = readValues(formData);

  // Minimum fill time, checked against the server clock. A missing/invalid timestamp counts as too fast.
  const startedAt = Number(formData.get(STARTED_AT_FIELD));
  const elapsed = Date.now() - startedAt;
  if (!Number.isFinite(startedAt) || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    return { status: "error", message: TOO_FAST_ERROR, errors: {}, values };
  }

  const errors = validate(values);
  if (Object.keys(errors).length > 0) return { status: "error", errors, values };

  try {
    const supabase = createSupabaseAdminClient();
    // Requires the five-parameter overload (with p_brand) to exist: apply the migration BEFORE deploying this.
    const { data, error } = await supabase.rpc("insert_repair_request_limited", {
      p_name: values.name.trim(),
      p_phone: normalizePhone(values.phone),
      p_appliance: values.appliance,
      p_problem: values.problem.trim(),
      p_brand: values.brand || null,
    });
    // Never log `values` (customer data).
    if (error) {
      // Operational log only: the Postgres error code. Never log message/details/hint (may echo row data).
      console.error("[repair-request] insert failed", { code: error.code ?? null });
      return { status: "error", message: GENERIC_ERROR, errors: {}, values };
    }
    if (data === "rate_limited") {
      return { status: "error", message: RATE_LIMITED_ERROR, errors: {}, values };
    }
    // Only an exact "ok" means the row was stored; "invalid_input" or anything else is a generic failure.
    if (data !== "ok") {
      console.error("[repair-request] insert rejected", { result: data === "invalid_input" ? data : "unexpected" });
      return { status: "error", message: GENERIC_ERROR, errors: {}, values };
    }
  } catch (caught) {
    // Operational log only: error class name. Never log message/stack (may contain secrets).
    console.error("[repair-request] insert threw", {
      name: caught instanceof Error ? caught.name : typeof caught,
    });
    return { status: "error", message: GENERIC_ERROR, errors: {}, values };
  }

  return { status: "success" };
}
