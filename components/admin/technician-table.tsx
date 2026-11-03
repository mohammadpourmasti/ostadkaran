import Link from "next/link";
import { formatNumber } from "@/lib/admin/format";
import { completionRate, percentLabel } from "@/lib/admin/report-metrics";
import type { ReportTechnician } from "@/lib/admin/repair-requests";

type Props = {
  technicians: ReportTechnician[];
  /** Query (no "?") with the report's date range, appended to each technician's request-list link. */
  rangeQuery: string;
};

const num = "px-3 py-3 text-center tabular-nums";

export function TechnicianTable({ technicians, rangeQuery }: Props) {
  if (technicians.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">تکنسینی تعریف نشده است.</p>;
  }

  const href = (id: string) => `/admin/requests?technician=${id}${rangeQuery ? `&${rangeQuery}` : ""}`;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted">
            <tr className="border-b border-border">
              <th scope="col" className="px-3 py-3 text-start font-semibold">تکنسین</th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">کل</th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">فعال</th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">در حال انجام</th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">تکمیل</th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">لغو</th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">درصد تکمیل</th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">تخصیص‌های ثبت‌شده</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {technicians.map((technician) => (
              <tr key={technician.id} className="transition-colors hover:bg-primary/[0.03]">
                <td className="px-3 py-3">
                  <Link href={href(technician.id)} className="font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-accent">
                    {technician.name}
                  </Link>
                  {!technician.isActive && <span className="ms-2 rounded-full bg-slate-200 px-2 py-0.5 text-[0.7rem] text-slate-700">غیرفعال</span>}
                </td>
                <td className={`${num} font-bold`}>{formatNumber(technician.total)}</td>
                <td className={num}>{formatNumber(technician.active)}</td>
                <td className={num}>{formatNumber(technician.inProgress)}</td>
                <td className={num}>{formatNumber(technician.completed)}</td>
                <td className={num}>{formatNumber(technician.cancelled)}</td>
                <td className={`${num} font-bold`}>{percentLabel(completionRate(technician.completed, technician.total))}</td>
                <td className={`${num} text-muted`}>{formatNumber(technician.assignmentsMade)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {technicians.map((technician) => (
          <li key={technician.id} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <Link href={href(technician.id)} className="font-bold text-primary focus-visible:outline-2 focus-visible:outline-accent">
                {technician.name}
              </Link>
              <span className="text-lg font-black tabular-nums">{percentLabel(completionRate(technician.completed, technician.total))}</span>
            </div>
            <dl className="mt-3 grid grid-cols-4 gap-2 text-center text-xs text-muted">
              <div><dt>کل</dt><dd className="mt-0.5 text-sm font-bold tabular-nums text-foreground">{formatNumber(technician.total)}</dd></div>
              <div><dt>فعال</dt><dd className="mt-0.5 text-sm font-bold tabular-nums text-foreground">{formatNumber(technician.active)}</dd></div>
              <div><dt>تکمیل</dt><dd className="mt-0.5 text-sm font-bold tabular-nums text-foreground">{formatNumber(technician.completed)}</dd></div>
              <div><dt>لغو</dt><dd className="mt-0.5 text-sm font-bold tabular-nums text-foreground">{formatNumber(technician.cancelled)}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
