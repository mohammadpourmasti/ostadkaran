"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import type { ActionState } from "@/lib/admin/action-state";
import { parseNewTechnicianInput, parseTechnicianInput } from "@/lib/admin/staff-validation";
import { createSupabaseSessionClient } from "@/lib/admin/supabase-session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Supabase "ban" with a very long duration = the Auth account cannot sign in or refresh a session.
const BAN_FOREVER = "876000h";

const NOT_MANAGER = "فقط مدیر می‌تواند کارکنان را مدیریت کند.";
const CONFIG_MISSING = "تنظیمات سرور (کلید Supabase) کامل نیست؛ حساب ساخته نشد.";

function describeDbError(error: { code?: string; message?: string }): string {
  const message = error.message ?? "";
  if (message.includes("not_allowed") || message.includes("not_authorized")) return NOT_MANAGER;
  if (message.includes("invalid_name")) return "نام باید بین ۲ تا ۸۰ نویسه باشد.";
  if (message.includes("invalid_phone")) return "شمارهٔ موبایل معتبر نیست.";
  if (message.includes("invalid_specialties")) return "تخصص‌ها معتبر نیستند.";
  if (message.includes("invalid_notes")) return "توضیحات حداکثر ۱۰۰۰ نویسه است.";
  if (message.includes("already_staff")) return "این حساب قبلاً در فهرست کارکنان است.";
  if (message.includes("technician_not_found")) return "این تکنسین پیدا نشد.";
  if (message.includes("not_technician")) return "این حساب تکنسین نیست.";
  if (error.code === "23505") return "این شمارهٔ موبایل قبلاً برای تکنسین دیگری ثبت شده است.";
  if (error.code === "PGRST202" || error.code === "42883") return "توابع مدیریت کارکنان روی Supabase ساخته نشده‌اند (migration اجرا نشده).";
  return "عملیات انجام نشد. دوباره تلاش کنید.";
}

function describeAuthCreateError(error: { code?: string; status?: number }): string {
  if (error.code === "email_exists" || error.code === "user_already_exists") return "این ایمیل قبلاً ثبت شده است.";
  if (error.code === "weak_password") return "رمز عبور از نظر Supabase ضعیف است؛ رمز قوی‌تری بگذارید.";
  if (error.code === "email_address_invalid" || error.code === "validation_failed") return "ایمیل معتبر نیست.";
  return "ساخت حساب در Supabase Auth انجام نشد. دوباره تلاش کنید.";
}

/**
 * Creates a technician: Auth account (server only, Auth Admin API) + staff profile + specialties.
 * The profile part is ONE database transaction; if it fails, the Auth account is deleted again (compensation),
 * so no half-created account is left behind. The initial password is never stored, logged or echoed back.
 */
export async function createTechnicianAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await requireStaff();
  if (staff.role !== "manager") return { status: "error", message: NOT_MANAGER };

  const parsed = parseNewTechnicianInput(formData);
  if (!parsed.ok) return { status: "error", message: parsed.message };
  const input = parsed.value;

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return { status: "error", message: CONFIG_MISSING };
  }

  // 1. Auth account. Public sign-up stays disabled in Supabase; only this server code creates accounts.
  const created = await admin.auth.admin.createUser({ email: input.email, password: input.password, email_confirm: true });
  if (created.error || !created.data.user) {
    return { status: "error", message: describeAuthCreateError(created.error ?? {}) };
  }
  const userId = created.data.user.id;

  // 2. Profile + specialties, atomically, authorised by the manager's own session inside the database.
  const supabase = await createSupabaseSessionClient();
  const { error } = await supabase.rpc("admin_create_technician", {
    p_user_id: userId,
    p_full_name: input.fullName,
    p_phone: input.phone,
    p_specialties: input.specialties,
    p_notes: input.notes || null,
    p_is_active: input.isActive,
  });

  if (error) {
    const removed = await admin.auth.admin.deleteUser(userId);
    if (removed.error) {
      console.error("[staff] orphan_auth_user_after_failed_profile", { userId });
      return {
        status: "error",
        message: `${describeDbError(error)} حساب ورود ساخته شده بود و حذف خودکارش هم انجام نشد؛ لطفاً در Supabase، بخش Authentication، کاربری با ایمیل «${input.email}» را دستی حذف کنید.`,
      };
    }
    return { status: "error", message: describeDbError(error) };
  }

  // 3. An inactive technician must not be able to sign in either.
  let warning = "";
  if (!input.isActive) {
    const banned = await admin.auth.admin.updateUserById(userId, { ban_duration: BAN_FOREVER });
    if (banned.error) warning = "&warn=ban";
  }

  // 4. Future SMS hook (invite / password link): lib/sms/events.ts -> notifyTechnicianInvited(). It is not called yet
  //    because the secure link flow does not exist; once it does, call it here. It never throws and, while SMS is
  //    disabled, sends nothing, so it can never undo the account created above.

  revalidatePath("/admin/staff");
  redirect(`/admin/staff/${userId}?created=1${warning}`);
}

export async function updateTechnicianAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await requireStaff();
  if (staff.role !== "manager") return { status: "error", message: NOT_MANAGER };

  const userId = String(formData.get("userId") ?? "");
  if (!UUID.test(userId)) return { status: "error", message: "شناسهٔ تکنسین نامعتبر است." };

  const parsed = parseTechnicianInput(formData);
  if (!parsed.ok) return { status: "error", message: parsed.message };
  const input = parsed.value;

  const supabase = await createSupabaseSessionClient();
  const { error } = await supabase.rpc("admin_update_technician", {
    p_user_id: userId,
    p_full_name: input.fullName,
    p_phone: input.phone,
    p_specialties: input.specialties,
    p_notes: input.notes || null,
  });
  if (error) return { status: "error", message: describeDbError(error) };

  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${userId}`);
  revalidatePath("/admin/requests");
  return { status: "success", message: "اطلاعات تکنسین ذخیره شد.", nonce: Date.now() };
}

/**
 * Activate / deactivate. History, assignments and requests are untouched. Deactivation also bans the Auth account
 * (no sign-in); the database function already refuses new assignments to an inactive technician.
 */
export async function setTechnicianActiveAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await requireStaff();
  if (staff.role !== "manager") return { status: "error", message: NOT_MANAGER };

  const userId = String(formData.get("userId") ?? "");
  const active = formData.get("active") === "true";
  const expectedOpen = Number.parseInt(String(formData.get("openAssigned") ?? "0"), 10) || 0;
  const confirmed = formData.get("confirm") === "on";

  if (!UUID.test(userId)) return { status: "error", message: "شناسهٔ تکنسین نامعتبر است." };
  if (!active && expectedOpen > 0 && !confirmed) {
    return { status: "error", message: "این تکنسین درخواست فعال دارد؛ برای ادامه تأیید را علامت بزنید." };
  }

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return { status: "error", message: CONFIG_MISSING };
  }

  // Activation: lift the ban first (if that fails nothing has changed). Deactivation: flag first, then ban.
  if (active) {
    const lifted = await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
    if (lifted.error) return { status: "error", message: "فعال‌سازی حساب ورود در Supabase انجام نشد. دوباره تلاش کنید." };
  }

  const supabase = await createSupabaseSessionClient();
  const { error } = await supabase.rpc("admin_set_technician_active", { p_user_id: userId, p_active: active });
  if (error) return { status: "error", message: describeDbError(error) };

  let message = active ? "تکنسین فعال شد." : "تکنسین غیرفعال شد. سوابق و درخواست‌های قبلی او حفظ شدند.";
  if (!active) {
    const banned = await admin.auth.admin.updateUserById(userId, { ban_duration: BAN_FOREVER });
    if (banned.error) message += " (ورود حساب در Supabase مسدود نشد؛ تا مسدودسازی دستی، فقط دسترسی پنل بسته است.)";
  }

  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${userId}`);
  revalidatePath("/admin/requests");
  return { status: "success", message, nonce: Date.now() };
}
