import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { RequestsFilters } from "@/components/admin/requests-filters";
import { RequestsList } from "@/components/admin/requests-list";
import { SetupRequired } from "@/components/admin/setup-required";
import { requireStaff } from "@/lib/admin/auth";
import { filtersToQuery, parseRequestFilters } from "@/lib/admin/filters";
import { formatNumber } from "@/lib/admin/format";
import { listRequests, listTechnicians } from "@/lib/admin/repair-requests";

export const metadata: Metadata = { title: "درخواست‌های تعمیر" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function RequestsPage({ searchParams }: Props) {
  await requireStaff();
  const filters = parseRequestFilters(await searchParams);
  const [result, technicians] = await Promise.all([listRequests(filters), listTechnicians(false)]);

  return (
    <>
      <PageHeader
        title="درخواست‌های تعمیر"
        description={result.ok ? `${formatNumber(result.data.total)} درخواست` : undefined}
      />
      <RequestsFilters filters={filters} technicians={technicians.ok ? technicians.data : []} />

      {!result.ok ? (
        <SetupRequired reason={result.reason} />
      ) : result.data.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="font-bold text-foreground">درخواستی پیدا نشد</p>
          <p className="mt-1 text-sm text-muted">فیلترها را تغییر دهید یا پاک کنید.</p>
        </div>
      ) : (
        <>
          <RequestsList items={result.data.items} back={`/admin/requests${filtersToQuery(filters)}`} />
          <Pagination filters={filters} total={result.data.total} />
        </>
      )}
    </>
  );
}
