import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { SetupRequired } from "@/components/admin/setup-required";
import { TechnicianList } from "@/components/admin/technician-list";
import { formatNumber } from "@/lib/admin/format";
import { requireManager } from "@/lib/admin/require-manager";
import { listTechnicianStaff, parseStaffFilters } from "@/lib/admin/staff";

export const metadata: Metadata = { title: "کارکنان" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const field =
  "h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent-strong focus:outline-2 focus:outline-offset-0 focus:outline-accent/40";

export default async function StaffPage({ searchParams }: Props) {
  await requireManager();
  const filters = parseStaffFilters(await searchParams);
  const result = await listTechnicianStaff(filters);
  const filtered = Boolean(filters.q || filters.active);

  return (
    <>
      <PageHeader
        title="کارکنان"
        description={result.ok ? `${formatNumber(result.data.total)} تکنسین` : "تکنسین‌ها را تعریف و مدیریت کنید."}
        actions={
          <Link
            href="/admin/staff/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            افزودن تکنسین
          </Link>
        }
      />

      <form method="get" action="/admin/staff" className="mb-5 grid gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:grid-cols-[1fr_12rem_auto]">
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          جست‌وجوی نام یا شمارهٔ تماس
          <input type="search" name="q" defaultValue={filters.q} maxLength={64} className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          وضعیت حساب
          <select name="active" defaultValue={filters.active} className={field}>
            <option value="">همه</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            اعمال
          </button>
          {filtered && (
            <Link href="/admin/staff" className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold text-muted hover:bg-slate-50">
              پاک کردن
            </Link>
          )}
        </div>
      </form>

      {!result.ok ? (
        <SetupRequired reason={result.reason} />
      ) : result.data.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="font-bold text-foreground">{filtered ? "تکنسینی با این فیلتر پیدا نشد" : "هنوز تکنسینی تعریف نشده است"}</p>
          <p className="mt-1 text-sm text-muted">{filtered ? "فیلترها را تغییر دهید یا پاک کنید." : "با «افزودن تکنسین» اولین تکنسین را بسازید."}</p>
        </div>
      ) : (
        <>
          <TechnicianList items={result.data.items} />
          {result.data.total > result.data.items.length && (
            <p className="mt-4 text-center text-xs text-muted">فقط {formatNumber(result.data.items.length)} مورد اول نمایش داده شد؛ جست‌وجو را دقیق‌تر کنید.</p>
          )}
        </>
      )}
    </>
  );
}
