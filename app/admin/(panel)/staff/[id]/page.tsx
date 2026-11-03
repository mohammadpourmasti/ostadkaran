import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { SetupRequired } from "@/components/admin/setup-required";
import { StatCard } from "@/components/admin/stat-card";
import { TechnicianActiveForm } from "@/components/admin/technician-active-form";
import { TechnicianForm } from "@/components/admin/technician-form";
import { formatDateTime } from "@/lib/admin/format";
import { requireManager } from "@/lib/admin/require-manager";
import { specialtyLabels } from "@/lib/admin/specialties";
import { getTechnician } from "@/lib/admin/staff";

export const metadata: Metadata = { title: "جزئیات تکنسین" };
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function TechnicianDetailPage({ params, searchParams }: Props) {
  await requireManager();
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const query = await searchParams;
  const created = query.created === "1";
  const banWarning = query.warn === "ban";

  const result = await getTechnician(id);
  if (!result.ok) return <SetupRequired reason={result.reason} />;
  if (!result.data) notFound();
  const tech = result.data;
  const list = `/admin/requests?technician=${tech.id}`;

  return (
    <>
      <Link href="/admin/staff" className="mb-4 inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-accent">
        → بازگشت به کارکنان
      </Link>

      <PageHeader
        title={tech.fullName}
        description={`تکنسین · ثبت: ${formatDateTime(tech.createdAt)}`}
        actions={
          <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${tech.isActive ? "bg-accent/15 text-teal-900" : "bg-slate-200 text-slate-700"}`}>
            {tech.isActive ? "حساب فعال" : "حساب غیرفعال"}
          </span>
        }
      />

      {created && (
        <p role="status" className="mb-5 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm leading-7 text-teal-950">
          تکنسین ساخته شد و در فهرست تخصیص ظاهر می‌شود. رمز اولیه در هیچ‌جا ذخیره نشده است؛ اگر آن را هنوز به تکنسین نداده‌اید، رمز جدیدی از Supabase (Authentication) برای او تعیین کنید.
        </p>
      )}
      {banWarning && (
        <p role="alert" className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
          پروفایل غیرفعال ثبت شد، ولی مسدودسازی ورود در Supabase Auth انجام نشد. تا آن زمان فقط دسترسی پنل بسته است؛ در Supabase، بخش Authentication، کاربر را مسدود کنید.
        </p>
      )}

      <section aria-label="آمار مأموریت‌ها" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="کل مأموریت‌ها" value={tech.assignedTotal} accent="bg-primary" href={list} />
        <StatCard label="فعال (باز)" value={tech.openTotal} hint="جدید، تماس‌گرفته، در حال انجام" accent="bg-cta" />
        <StatCard label="در حال انجام" value={tech.inProgress} accent="bg-primary/70" href={`${list}&status=in_progress`} />
        <StatCard label="تکمیل‌شده" value={tech.completed} accent="bg-accent-strong" href={`${list}&status=completed`} />
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5 lg:col-span-2">
          <h2 className="mb-1 font-extrabold text-foreground">ویرایش اطلاعات</h2>
          <p className="mb-4 text-xs leading-6 text-muted">تخصص‌ها: {specialtyLabels(tech.specialties)}</p>
          <TechnicianForm
            mode="edit"
            initial={{
              userId: tech.id,
              fullName: tech.fullName,
              phone: tech.phone ?? "",
              specialties: tech.specialties,
              notes: tech.notes ?? "",
              isActive: tech.isActive,
            }}
          />
        </section>

        <section className="h-fit rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 font-extrabold text-foreground">وضعیت حساب</h2>
          <TechnicianActiveForm userId={tech.id} isActive={tech.isActive} openAssigned={tech.openTotal} />
        </section>
      </div>
    </>
  );
}
