"use server";

import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/admin/auth";
import { createSupabaseSessionClient } from "@/lib/admin/supabase-session";
import type { ActionState } from "@/lib/admin/action-state";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sign-in failures are shown in Persian, with the original Supabase text kept for anything not recognised.
function describeAuthError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("invalid login credentials")) return "ایمیل یا رمز عبور درست نیست.";
  if (text.includes("email not confirmed")) return "ایمیل این حساب هنوز تأیید نشده است.";
  if (text.includes("rate limit") || text.includes("too many")) return "تعداد تلاش‌ها زیاد بود. چند دقیقه بعد دوباره امتحان کنید.";
  return `ورود انجام نشد: ${message}`;
}

// Only same-site dashboard paths are accepted as a post-login destination.
function safeNext(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/admin";
  return /^\/admin(\/[A-Za-z0-9\-_/]*)?$/.test(value) ? value : "/admin";
}

export async function loginAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL.test(email)) return { status: "error", message: "ایمیل را درست وارد کنید." };
  if (password.length < 6) return { status: "error", message: "رمز عبور حداقل ۶ نویسه است." };

  let supabase;
  try {
    supabase = await createSupabaseSessionClient();
  } catch {
    return { status: "error", message: "اتصال به Supabase تنظیم نشده است (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: describeAuthError(error.message) };

  // Signing in is not enough: the account must also be active staff with an allowed role.
  const session = await getStaffSession();

  if (session.status === "ok") redirect(safeNext(formData.get("next")));

  await supabase.auth.signOut();

  if (session.status === "setup_required") {
    return { status: "error", message: "جدول‌های داشبورد هنوز روی Supabase ساخته نشده‌اند (migrationها اجرا نشده‌اند)." };
  }
  if (session.status === "forbidden" && session.reason === "inactive") {
    return { status: "error", message: "این حساب غیرفعال شده است." };
  }
  return { status: "error", message: "این حساب مجوز ورود به پنل مدیریت را ندارد." };
}

export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createSupabaseSessionClient();
    await supabase.auth.signOut();
  } catch {
    // No session to end.
  }
  redirect("/admin/login");
}
