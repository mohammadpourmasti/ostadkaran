import Link from "next/link";
import { applianceLabel } from "@/lib/admin/labels";
import { formatAge, formatDateTime, telHref } from "@/lib/admin/format";
import type { RequestListItem } from "@/lib/admin/repair-requests";
import { PhoneRingIcon } from "./icons";
import { StatusBadge } from "./status-badge";

function TechnicianLabel({ name }: { name: string | null }) {
  return name ? (
    <span className="text-foreground">{name}</span>
  ) : (
    <span className="rounded-full bg-cta/15 px-2 py-0.5 text-[0.7rem] font-semibold text-amber-950">بدون تکنسین</span>
  );
}

// `back` is the filtered list URL, so the detail page can return to the same filters and page.
export function RequestsList({ items, back }: { items: RequestListItem[]; back: string }) {
  const detailHref = (id: string) => `/admin/requests/${id}?back=${encodeURIComponent(back)}`;

  return (
    <>
      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 text-start font-semibold">مشتری</th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">دستگاه</th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">ثبت</th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">وضعیت</th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">تکنسین</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">تماس</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-primary/[0.03]">
                <td className="px-4 py-3">
                  <Link href={detailHref(item.id)} className="block font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-accent">
                    {item.name}
                  </Link>
                  <span dir="ltr" className="block text-start text-xs text-muted">{item.phone}</span>
                </td>
                <td className="px-4 py-3">
                  {applianceLabel(item.appliance)}
                  {item.brand && <span className="block text-xs text-muted">{item.brand}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="block">{formatDateTime(item.createdAt)}</span>
                  <span className="block text-xs text-muted">{formatAge(item.createdAt)}</span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3 text-xs"><TechnicianLabel name={item.technicianName} /></td>
                <td className="px-4 py-3 text-end">
                  <a
                    href={telHref(item.phone)}
                    aria-label={`تماس با ${item.name}`}
                    className="inline-flex size-10 items-center justify-center rounded-xl border border-border text-accent-strong transition-colors hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <PhoneRingIcon className="size-5" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: compact cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <Link href={detailHref(item.id)} className="min-w-0 flex-1 focus-visible:outline-2 focus-visible:outline-accent">
                <span className="block truncate font-bold text-primary">{item.name}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {applianceLabel(item.appliance)}
                  {item.brand ? ` · ${item.brand}` : ""}
                </span>
              </Link>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-2 text-xs text-muted">تکنسین: <TechnicianLabel name={item.technicianName} /></p>
            {item.problemPreview && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{item.problemPreview}</p>}
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-muted">{formatAge(item.createdAt)}</span>
              <a
                href={telHref(item.phone)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent/15 px-4 text-sm font-bold text-teal-900 transition-colors hover:bg-accent/25 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <PhoneRingIcon className="size-5" />
                <span dir="ltr">{item.phone}</span>
              </a>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
