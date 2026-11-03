import Link from "next/link";
import { formatNumber } from "@/lib/admin/format";
import { specialtyLabels } from "@/lib/admin/specialties";
import type { TechnicianSummary } from "@/lib/admin/staff";

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${active ? "bg-accent/15 text-teal-900" : "bg-slate-200 text-slate-700"}`}>
      {active ? "فعال" : "غیرفعال"}
    </span>
  );
}

export function TechnicianList({ items }: { items: TechnicianSummary[] }) {
  const href = (id: string) => `/admin/staff/${id}`;
  const num = "px-3 py-3 text-center tabular-nums";

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 text-start font-semibold">تکنسین</th>
              <th scope="col" className="px-3 py-3 text-start font-semibold">تخصص‌ها</th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">مأموریت‌ها</th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">در حال انجام</th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">تکمیل‌شده</th>
              <th scope="col" className="px-3 py-3 text-start font-semibold">وضعیت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-primary/[0.03]">
                <td className="px-4 py-3">
                  <Link href={href(item.id)} className="font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-accent">
                    {item.fullName}
                  </Link>
                  <span dir="ltr" className="block text-start text-xs text-muted">{item.phone ?? "—"}</span>
                </td>
                <td className="max-w-56 px-3 py-3 text-xs leading-6 text-muted">{specialtyLabels(item.specialties)}</td>
                <td className={`${num} font-bold`}>{formatNumber(item.assignedTotal)}</td>
                <td className={num}>{formatNumber(item.inProgress)}</td>
                <td className={num}>{formatNumber(item.completed)}</td>
                <td className="px-3 py-3"><ActiveBadge active={item.isActive} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <Link href={href(item.id)} className="min-w-0 flex-1 focus-visible:outline-2 focus-visible:outline-accent">
                <span className="block truncate font-bold text-primary">{item.fullName}</span>
                <span dir="ltr" className="block text-start text-xs text-muted">{item.phone ?? "—"}</span>
              </Link>
              <ActiveBadge active={item.isActive} />
            </div>
            <p className="mt-2 text-xs leading-6 text-muted">{specialtyLabels(item.specialties)}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-muted">
              <div><dt>مأموریت</dt><dd className="mt-0.5 text-sm font-bold tabular-nums text-foreground">{formatNumber(item.assignedTotal)}</dd></div>
              <div><dt>در حال انجام</dt><dd className="mt-0.5 text-sm font-bold tabular-nums text-foreground">{formatNumber(item.inProgress)}</dd></div>
              <div><dt>تکمیل</dt><dd className="mt-0.5 text-sm font-bold tabular-nums text-foreground">{formatNumber(item.completed)}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
