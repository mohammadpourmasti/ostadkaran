import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { requireStaff } from "@/lib/admin/auth";
import { roleLabels } from "@/lib/admin/statuses";

export const metadata: Metadata = { title: "تنظیمات" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const staff = await requireStaff();

  return (
    <>
      <PageHeader title="تنظیمات" description="اطلاعات حساب شما. مدیریت کارکنان در نسخه‌های بعد اضافه می‌شود." />

      <section className="max-w-xl rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold text-muted">نام</dt>
            <dd className="mt-1 font-bold">{staff.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted">نقش</dt>
            <dd className="mt-1 font-bold">{roleLabels[staff.role]}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold text-muted">ایمیل</dt>
            <dd dir="ltr" className="mt-1 text-start font-semibold">{staff.email ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-5 max-w-xl rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-extrabold">دسترسی هر نقش</h2>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-muted">
          <li><strong className="text-foreground">مدیر:</strong> مشاهده، یادداشت و تغییر وضعیت به هر وضعیت مجاز.</li>
          <li><strong className="text-foreground">اپراتور:</strong> مشاهده، یادداشت؛ جدید ← تماس گرفته شده یا لغو، و تماس گرفته شده ← لغو.</li>
          <li><strong className="text-foreground">تکنسین:</strong> در نسخهٔ اول به این بخش دسترسی ندارد.</li>
        </ul>
      </section>
    </>
  );
}
