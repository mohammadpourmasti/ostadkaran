import type { Metadata } from "next";
import Link from "next/link";
import { ActivityList } from "@/components/admin/activity-list";
import { DailyChart } from "@/components/admin/daily-chart";
import { PageHeader } from "@/components/admin/page-header";
import { SetupRequired } from "@/components/admin/setup-required";
import { StatCard } from "@/components/admin/stat-card";
import { StatusDistribution } from "@/components/admin/status-distribution";
import { requireStaff } from "@/lib/admin/auth";
import { formatAge, formatNumber } from "@/lib/admin/format";
import { applianceLabel } from "@/lib/admin/labels";
import { getStats, listRequests, recentActivity } from "@/lib/admin/repair-requests";
import { parseRequestFilters } from "@/lib/admin/filters";

export const metadata: Metadata = { title: "نمای کلی" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const staff = await requireStaff();

  const [stats, newest, activity] = await Promise.all([
    getStats(),
    listRequests({ ...parseRequestFilters({}), status: "new" }),
    recentActivity(8),
  ]);

  if (!stats.ok) {
    return (
      <>
        <PageHeader title="نمای کلی" />
        <SetupRequired reason={stats.reason} />
      </>
    );
  }

  const { total, byStatus, daily, staleNew } = stats.data;
  const first = staff.fullName.split(" ")[0];

  return (
    <>
      <PageHeader title={`سلام ${first}`} description="وضعیت درخواست‌های تعمیر در یک نگاه." />

      <section aria-label="آمار درخواست‌ها" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="کل درخواست‌ها" value={total} accent="bg-primary" href="/admin/requests" />
        <StatCard label="جدید" value={byStatus.new} accent="bg-cta" href="/admin/requests?status=new" />
        <StatCard label="تماس گرفته‌شده" value={byStatus.contacted} hint="در انتظار پیگیری" accent="bg-sky-500" href="/admin/requests?status=contacted" />
        <StatCard label="در حال انجام" value={byStatus.in_progress} accent="bg-primary/70" href="/admin/requests?status=in_progress" />
        <StatCard label="تکمیل‌شده" value={byStatus.completed} accent="bg-accent-strong" href="/admin/requests?status=completed" />
        <StatCard label="لغوشده" value={byStatus.cancelled} accent="bg-slate-400" href="/admin/requests?status=cancelled" />
      </section>

      {staleNew > 0 && (
        <Link
          href="/admin/requests?status=new&sort=oldest"
          className="mt-4 flex items-center gap-3 rounded-2xl border border-cta/50 bg-cta/10 p-4 transition-colors hover:bg-cta/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-cta" />
          <span className="text-sm font-semibold leading-6 text-amber-950">
            {formatNumber(staleNew)} درخواست جدید بیش از یک روز است که پیگیری نشده‌اند.
          </span>
          <span className="ms-auto shrink-0 text-sm font-bold text-primary">مشاهده ←</span>
        </Link>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5 lg:col-span-3">
          <h2 className="mb-4 font-extrabold text-foreground">درخواست‌ها در ۱۴ روز گذشته</h2>
          <DailyChart data={daily} />
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5 lg:col-span-2">
          <h2 className="mb-4 font-extrabold text-foreground">توزیع وضعیت‌ها</h2>
          <StatusDistribution counts={byStatus} total={total} />
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-foreground">جدیدترین درخواست‌های بی‌پیگیری</h2>
            <Link href="/admin/requests?status=new" className="text-sm font-bold text-primary hover:underline">همه</Link>
          </div>
          {newest.ok ? (
            newest.data.items.length === 0 ? (
              <p className="py-4 text-sm text-muted">درخواست جدیدی نیست.</p>
            ) : (
              <ul className="divide-y divide-border">
                {newest.data.items.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <Link href={`/admin/requests/${item.id}`} className="flex items-center gap-3 py-3 transition-colors hover:bg-primary/[0.03] focus-visible:outline-2 focus-visible:outline-accent">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-primary">{item.name}</span>
                        <span className="block text-xs text-muted">{applianceLabel(item.appliance)}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted">{formatAge(item.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <SetupRequired reason={newest.reason} />
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 font-extrabold text-foreground">آخرین فعالیت‌ها</h2>
          {activity.ok ? <ActivityList entries={activity.data} /> : <SetupRequired reason={activity.reason} />}
        </section>
      </div>
    </>
  );
}
