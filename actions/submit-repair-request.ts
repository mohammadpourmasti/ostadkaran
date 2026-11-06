"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getTrustedClientIp } from "@/lib/security/client-ip";
import { verifyFormToken } from "@/lib/security/form-token";
import { claimOnce, releaseClaim, takeRateLimit } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { fieldOrder, normalizePhone, validate, type FieldErrors, type FieldValues } from "@/lib/repair-request/validation";

export type RepairRequestState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message?: string; errors: FieldErrors; values: FieldValues };

const TOO_FAST_ERROR = "ارسال فرم خیلی سریع انجام شد. لطفاً چند ثانیه صبر کنید و دوباره تلاش کنید.";
const GENERIC_ERROR = "ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید یا با ما تماس بگیرید.";
const FORM_EXPIRED_ERROR = "اعتبار فرم تمام شده است. لطفاً صفحه را تازه‌سازی کنید و دوباره تلاش کنید.";
const IP_LIMITED_ERROR =
  "تعداد ارسال‌ها از این شبکه در مدت کوتاهی زیاد بوده است. لطفاً چند دقیقه بعد دوباره تلاش کنید یا با ما تماس بگیرید.";
const BUSY_ERROR = "در حال حاضر درخواست‌های زیادی دریافت می‌شود. لطفاً کمی بعد دوباره تلاش کنید یا با ما تماس بگیرید.";
const RATE_LIMITED_ERROR = "تعداد درخواست‌های مجاز برای این شماره تلفن در یک ساعت اخیر تکمیل شده است. لطفاً کمی بعد دوباره تلاش کنید.";

// Spam protection, all decided on the server (nothing the browser sends is trusted on its own):
//   1. a hidden honeypot field;
//   2. a signed form token (lib/security/form-token.ts): proves the form was loaded here and that at least
//      3 seconds passed, measured by the server clock;
//   3. limits per client IP (only from a trusted proxy header, see lib/security/client-ip.ts) and an overall
//      cap, counted after field validation so a visitor fixing typos is never penalised;
//   4. identical submissions within a few minutes are accepted once (double-clicks, retries);
//   5. the per-phone limit inside the database function (authoritative, shared by every process).
// The IP limits are deliberately generous so several real customers behind one shared IP (NAT, office, mobile
// carrier) are not blocked. CAPTCHA is not used.
const HONEYPOT_FIELD = "website";
const FORM_TOKEN_FIELD = "formToken";
const IP_BURST = { limit: 4, windowMs: 10 * 60 * 1000 };
const IP_HOURLY = { limit: 12, windowMs: 60 * 60 * 1000 };
const GLOBAL_HOURLY = { limit: 300, windowMs: 60 * 60 * 1000 };
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
let warnedMissingIpHeader = false;

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

  // Signed form token: checked here without using it up, so fixing a field error and resubmitting still works.
  const token = formData.get(FORM_TOKEN_FIELD);
  let tokenState: ReturnType<typeof verifyFormToken> = "invalid";
  try {
    tokenState = typeof token === "string" ? verifyFormToken(token) : "invalid";
  } catch {
    // Server key missing: fail closed with the generic message.
    return { status: "error", message: GENERIC_ERROR, errors: {}, values };
  }
  if (tokenState === "too_fast") return { status: "error", message: TOO_FAST_ERROR, errors: {}, values };
  if (tokenState !== "ok") return { status: "error", message: FORM_EXPIRED_ERROR, errors: {}, values };

  const errors = validate(values);
  if (Object.keys(errors).length > 0) return { status: "error", errors, values };

  // From here on the submission is a real attempt: count the token use and apply the limits.
  if (typeof token === "string" && verifyFormToken(token, { consume: true }) !== "ok") {
    return { status: "error", message: FORM_EXPIRED_ERROR, errors: {}, values };
  }

  const ip = getTrustedClientIp(await headers());
  if (!ip && !warnedMissingIpHeader) {
    warnedMissingIpHeader = true;
    console.warn("[repair-request] TRUSTED_IP_HEADER is not set; per-IP limits are disabled.");
  }
  if (ip) {
    const burstOk = takeRateLimit(`ip10m:${ip}`, IP_BURST.limit, IP_BURST.windowMs);
    const hourlyOk = takeRateLimit(`ip1h:${ip}`, IP_HOURLY.limit, IP_HOURLY.windowMs);
    if (!burstOk || !hourlyOk) return { status: "error", message: IP_LIMITED_ERROR, errors: {}, values };
  }
  if (!takeRateLimit("global:repair-request", GLOBAL_HOURLY.limit, GLOBAL_HOURLY.windowMs)) {
    return { status: "error", message: BUSY_ERROR, errors: {}, values };
  }

  // The same request sent twice shortly after each other (double tap, retry) is stored once. The claim is
  // released if storing fails, so a genuine retry still goes through.
  const claimKey = `dup:${createHash("sha256")
    .update([normalizePhone(values.phone), values.appliance, values.problem.trim().replace(/\s+/g, " ")].join("|"))
    .digest("hex")}`;
  if (!claimOnce(claimKey, DUPLICATE_WINDOW_MS)) return { status: "success" };

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
      releaseClaim(claimKey);
      console.error("[repair-request] insert failed", { code: error.code ?? null });
      return { status: "error", message: GENERIC_ERROR, errors: {}, values };
    }
    if (data === "rate_limited") {
      releaseClaim(claimKey);
      return { status: "error", message: RATE_LIMITED_ERROR, errors: {}, values };
    }
    // Only an exact "ok" means the row was stored; "invalid_input" or anything else is a generic failure.
    if (data !== "ok") {
      releaseClaim(claimKey);
      console.error("[repair-request] insert rejected", { result: data === "invalid_input" ? data : "unexpected" });
      return { status: "error", message: GENERIC_ERROR, errors: {}, values };
    }
  } catch (caught) {
    releaseClaim(claimKey);
    // Operational log only: error class name. Never log message/stack (may contain secrets).
    console.error("[repair-request] insert threw", {
      name: caught instanceof Error ? caught.name : typeof caught,
    });
    return { status: "error", message: GENERIC_ERROR, errors: {}, values };
  }

  return { status: "success" };
}
