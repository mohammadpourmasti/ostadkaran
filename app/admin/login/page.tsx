import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getStaffSession } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "ورود" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const notices: Record<string, string> = {
  forbidden: "این حساب مجوز ورود به پنل مدیریت را ندارد.",
  setup: "جدول‌های داشبورد هنوز روی Supabase ساخته نشده‌اند (migrationها اجرا نشده‌اند).",
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const rawNext = typeof params.next === "string" ? params.next : "/admin";
  const next = /^\/admin(\/[A-Za-z0-9\-_/]*)?$/.test(rawNext) ? rawNext : "/admin";

  let configured = true;
  let signedIn = false;
  try {
    signedIn = (await getStaffSession()).status === "ok";
  } catch {
    // The Supabase environment variables are missing or incomplete.
    configured = false;
  }

  if (signedIn) redirect("/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/[0.06] to-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span aria-hidden="true" className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-accent shadow-lg shadow-primary/20">
            ا
          </span>
          <h1 className="mt-4 text-2xl font-black text-primary">پنل مدیریت استادکاران</h1>
          <p className="mt-1 text-sm text-muted">فقط برای کارکنان مجاز</p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          {!configured && (
            <p role="alert" className="mb-4 rounded-xl border border-cta/40 bg-cta/10 px-3 py-2.5 text-sm leading-6 text-amber-950">
              اتصال Supabase تنظیم نشده است: NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY را در .env.local بگذارید.
            </p>
          )}
          {notices[error] && (
            <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-6 text-red-900">
              {notices[error]}
            </p>
          )}
          <LoginForm next={next} />
        </div>

        <p className="mt-5 text-center text-xs leading-6 text-muted">ثبت‌نام عمومی وجود ندارد؛ حساب‌ها را مدیر می‌سازد.</p>
      </div>
    </main>
  );
}
