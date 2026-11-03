import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { ReportBars } from "@/components/admin/report-bars";
import { ReportEvents } from "@/components/admin/report-events";
import { ReportFiltersForm } from "@/components/admin/report-range-form";
import { ReportSeriesChart } from "@/components/admin/report-series-chart";
import { SetupRequired } from "@/components/admin/setup-required";
import { StatCard } from "@/components/admin/stat-card";
import { StatusDistribution } from "@/components/admin/status-distribution";
import { TechnicianCompare } from "@/components/admin/technician-compare";
import { TechnicianTable } from "@/components/admin/technician-table";
import { requireStaff } from "@/lib/admin/auth";
import { formatDay, formatDuration, formatNumber, formatPercent } from "@/lib/admin/format";
import { applianceRows } from "@/lib/admin/report-metrics";
import { buildReportQuery, parseReportFilters, type ReportFilters } from "@/lib/admin/report-range";
import { getReport, listTechnicians, type ReportData } from "@/lib/admin/repair-requests";

export const metadata: Metadata = { title: "گزارش‌ها" };
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminReportsPage({ searchParams }: PageProps) {
  await requireStaff();
  const filters = parseReportFilters(await searchParams);
  const [report, technicians] = await Promise.all([getReport(filters), listTechnicians(false)]);
  const { range } = filters;

  return (
    <>
      <PageHeader
        title="گزارش‌ها"
        description={`درخواست‌های ثبت‌شده از ${formatDay(range.fromDay)} تا ${formatDay(range.toDay)}، بر اساس تاریخ ثبت.`}
        actions={report.ok ? <ExportLinks filters={filters} /> : undefined}
      />
      <ReportFiltersForm filters={filters} technicians={technicians.ok ? technicians.data : []} />

      {!report.ok ? <SetupRequired reason={report.reason} /> : <Content report={report.data} filters={filters} />}
    </>
  );
}

function ExportLinks({ filters }: { filters: ReportFilters }) {
  const link =
    "inline-flex min-h-10 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  return (
    <div className="flex flex-wrap gap-2">
      <a href={`/admin/reports/export?${buildReportQuery(filters, { extra: { kind: "requests" } })}`} className={link}>
        خروجی CSV درخواست‌ها
      </a>
      <a href={`/admin/reports/export?${buildReportQuery(filters, { extra: { kind: "technicians" } })}`} className={link}>
        خروجی CSV تکنسین‌ها
      </a>
    </div>
  );
}

function Panel({ title, note, children, className = "" }: { title: string; note?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5 ${className}`}>
      <h2 className="font-extrabold text-foreground">{title}</h2>
      {note && <p className="mt-1 text-xs leading-6 text-muted">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Content({ report, filters }: { report: ReportData; filters: ReportFilters }) {
  const { total, assigned, unassigned, byStatus, bucket, series, appliances, brands, technicians, firstContact, completion, events } = report;
  const { range } = filters;
  const rangeQuery = `from=${range.fromDay}&to=${range.toDay}`;
  const listBase = `${rangeQuery}${filters.status ? `&status=${filters.status}` : ""}${filters.appliance ? `&appliance=${filters.appliance}` : ""}`;

  if (total === 0 && technicians.every((technician) => technician.assignmentsMade === 0) && events.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <p className="font-bold text-foreground">در این بازه و با این فیلترها درخواستی ثبت نشده است.</p>
        <p className="mt-1 text-sm text-muted">فیلترها یا بازه را تغییر دهید.</p>
      </div>
    );
  }

  return (
    <>
      <section aria-label="شاخص‌های اصلی" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="کل درخواست‌ها" value={total} accent="bg-primary" href={`/admin/requests?${listBase}`} />
        <StatCard label="جدید" value={byStatus.new} hint={formatPercent(byStatus.new, total)} accent="bg-cta" href={`/admin/requests?status=new&${rangeQuery}`} />
        <StatCard label="تماس گرفته‌شده" value={byStatus.contacted} hint={formatPercent(byStatus.contacted, total)} accent="bg-sky-500" href={`/admin/requests?status=contacted&${rangeQuery}`} />
        <StatCard label="در حال انجام" value={byStatus.in_progress} hint={formatPercent(byStatus.in_progress, total)} accent="bg-primary/70" href={`/admin/requests?status=in_progress&${rangeQuery}`} />
        <StatCard label="تکمیل‌شده" value={byStatus.completed} hint={formatPercent(byStatus.completed, total)} accent="bg-accent-strong" href={`/admin/requests?status=completed&${rangeQuery}`} />
        <StatCard label="لغوشده" value={byStatus.cancelled} hint={formatPercent(byStatus.cancelled, total)} accent="bg-slate-400" href={`/admin/requests?status=cancelled&${rangeQuery}`} />
        <StatCard label="بدون تکنسین" value={unassigned} hint="تخصیص‌نیافته" accent="bg-amber-500" href={`/admin/requests?technician=none&${listBase}`} />
        <StatCard label="مأموریت‌های تخصیص‌یافته" value={assigned} hint="دارای تکنسین مسئول" accent="bg-teal-600" />
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <Panel title={`روند ثبت درخواست‌ها (${bucket === "month" ? "ماهانه" : "روزانه"})`} className="lg:col-span-3">
          <ReportSeriesChart data={series} bucket={bucket} />
        </Panel>
        <Panel title="توزیع وضعیت‌ها" className="lg:col-span-2">
          <StatusDistribution counts={byStatus} total={total} />
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="درخواست‌ها بر اساس نوع دستگاه">
          <ReportBars total={total} empty="داده‌ای نیست." items={applianceRows(appliances).map((row) => ({ label: row.label, count: row.count }))} />
        </Panel>
        <Panel title="برندهای پرتکرار" note="فقط درخواست‌هایی که برند ثبت کرده‌اند.">
          <ReportBars total={total} empty="برندی ثبت نشده است." items={brands.map((item) => ({ label: item.key, count: item.count }))} />
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <Panel
          title="مقایسهٔ مأموریت‌های تکنسین‌ها"
          note="تعداد درخواست‌های بازه به تفکیک تکنسین مسئول فعلی؛ درخواست‌های بدون تکنسین جدا حساب می‌شوند."
          className="lg:col-span-2"
        >
          <TechnicianCompare technicians={technicians} />
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-950">
            بدون تکنسین: <strong>{formatNumber(unassigned)}</strong> از {formatNumber(total)} درخواست
          </p>
        </Panel>
        <Panel title="عملکرد تکنسین‌ها" note="بر اساس تکنسین مسئول فعلی هر درخواست. نام تکنسین را بزنید تا درخواست‌های او در همین بازه باز شود." className="lg:col-span-3">
          <TechnicianTable technicians={technicians} rangeQuery={rangeQuery} />
        </Panel>
      </div>

      <Panel title="سرعت پاسخ‌گویی" note="بر اساس تاریخچهٔ تغییر وضعیتِ ثبت‌شده در پنل؛ درخواست‌هایی که هنوز وضعیتشان تغییر نکرده یا قبل از پنل بسته شده‌اند در این میانگین‌ها نیستند." className="mt-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <DurationBlock title="تا اولین پیگیری" data={firstContact} />
          <DurationBlock title="تا تکمیل" data={completion} />
        </dl>
      </Panel>

      <Panel title="تاریخچهٔ تغییر مسئولیت" note="آخرین تخصیص‌ها، تغییرها و برداشتن‌ها در این بازه (حداکثر ۱۵ مورد)." className="mt-5">
        <ReportEvents events={events} />
      </Panel>

      <details className="mt-5 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
        <summary className="cursor-pointer font-extrabold text-foreground focus-visible:outline-2 focus-visible:outline-accent">تعریف شاخص‌ها و روش محاسبه</summary>
        <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-7 text-foreground/85">
          <li>مجموعهٔ گزارش: درخواست‌هایی که در بازهٔ انتخابی (به وقت تهران) ثبت شده‌اند و با فیلترهای وضعیت، دستگاه و تکنسین می‌خوانند.</li>
          <li>تکنسین هر درخواست = تکنسین مسئول فعلی. درخواستِ تکمیل‌شده یا لغوشده بسته است و تکنسینش دیگر عوض نمی‌شود؛ پس نتیجهٔ آن همیشه به همان تکنسینی که انجامش داده می‌ماند.</li>
          <li>فعال = وضعیت «جدید»، «تماس گرفته شده» یا «در حال انجام».</li>
          <li>درصد تکمیل = تکمیل‌شده ÷ همهٔ درخواست‌های آن تکنسین در مجموعهٔ گزارش. لغوشده هرگز تکمیل‌شده حساب نمی‌شود و اگر تکنسین درخواستی نداشته باشد «—» نشان داده می‌شود.</li>
          <li>بدون تکنسین همیشه جدا نشان داده می‌شود و در هیچ تکنسینی شمرده نمی‌شود.</li>
          <li>تخصیص‌های ثبت‌شده = تعداد دفعاتی که در بازه، درخواستی به این تکنسین سپرده شده است (از تاریخچهٔ تخصیص). این عدد سابقهٔ اقدام‌هاست، نه تعداد درخواست‌های فعلی او، و فیلتر وضعیت و دستگاه را اعمال نمی‌کند.</li>
          <li>خروجی CSV همین فیلترها را اعمال می‌کند و نام، تلفن یا شرح مشکل مشتری در آن نیست.</li>
        </ul>
        <p className="mt-3 text-xs text-muted">
          <Link href="/admin/requests" className="font-semibold text-primary hover:underline">فهرست درخواست‌ها ←</Link>
        </p>
      </details>
    </>
  );
}

function DurationBlock({ title, data }: { title: string; data: { count: number; avgHours: number | null; medianHours: number | null } }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <dt className="text-xs font-semibold text-muted">{title}</dt>
      {data.count === 0 ? (
        <dd className="mt-2 text-sm text-muted">دادهٔ کافی نیست.</dd>
      ) : (
        <dd className="mt-2">
          <span className="text-2xl font-black tabular-nums text-foreground">{formatDuration(data.medianHours)}</span>
          <span className="ms-2 text-xs text-muted">میانه</span>
          <span className="mt-1 block text-xs text-muted">
            میانگین {formatDuration(data.avgHours)} · از {formatNumber(data.count)} درخواست
          </span>
        </dd>
      )}
    </div>
  );
}
