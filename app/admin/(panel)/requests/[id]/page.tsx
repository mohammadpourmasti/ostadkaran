import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssignmentHistory } from "@/components/admin/assignment-history";
import { AssignmentPanel } from "@/components/admin/assignment-panel";
import { NoteForm } from "@/components/admin/note-form";
import { PageHeader } from "@/components/admin/page-header";
import { PhoneRingIcon } from "@/components/admin/icons";
import { SetupRequired } from "@/components/admin/setup-required";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatusForm } from "@/components/admin/status-form";
import { Timeline } from "@/components/admin/timeline";
import { requireStaff } from "@/lib/admin/auth";
import { formatDateTime, telHref } from "@/lib/admin/format";
import { applianceLabel } from "@/lib/admin/labels";
import { getAssignment, getRequest, listAssignmentEvents, listNotes, listTechnicians } from "@/lib/admin/repair-requests";
import { allowedTransitions } from "@/lib/admin/statuses";

export const metadata: Metadata = { title: "جزئیات درخواست" };
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function RequestDetailPage({ params, searchParams }: Props) {
  const staff = await requireStaff();
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  // Only paths inside the request list are accepted as the "back" target.
  const rawBack = (await searchParams).back;
  const back = typeof rawBack === "string" && /^\/admin\/requests(\?[A-Za-z0-9=&%_.\-+:]*)?$/.test(rawBack) ? rawBack : "/admin/requests";

  const [request, notes, assignment, assignmentEvents, technicians] = await Promise.all([
    getRequest(id),
    listNotes(id),
    getAssignment(id),
    listAssignmentEvents(id),
    listTechnicians(true),
  ]);

  if (!request.ok) return <SetupRequired reason={request.reason} />;
  if (!request.data) notFound();

  const item = request.data;
  const options = allowedTransitions(staff.role, item.status);

  return (
    <>
      <Link href={back} className="mb-4 inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-accent">
        → بازگشت به فهرست
      </Link>

      <PageHeader title={item.name} actions={<StatusBadge status={item.status} />} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
            <a
              href={telHref(item.phone)}
              className="mb-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent-strong px-5 text-base font-bold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <PhoneRingIcon className="size-5" />
              تماس با مشتری
              <span dir="ltr" className="font-semibold text-white/90">{item.phone}</span>
            </a>

            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-muted">شناسهٔ درخواست</dt>
                <dd dir="ltr" className="mt-1 break-all text-start text-xs text-foreground/80">{item.id}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted">تاریخ ثبت</dt>
                <dd className="mt-1 font-semibold">{formatDateTime(item.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted">نوع دستگاه</dt>
                <dd className="mt-1 font-semibold">{applianceLabel(item.appliance)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted">برند</dt>
                <dd className="mt-1 font-semibold">{item.brand ?? "ثبت نشده"}</dd>
              </div>
            </dl>

            <h2 className="mb-2 mt-5 text-xs font-semibold text-muted">شرح مشکل (به‌نقل از مشتری)</h2>
            <p className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-8 text-foreground">{item.problem}</p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 font-extrabold text-foreground">سوابق و یادداشت‌ها</h2>
            {notes.ok ? <Timeline entries={notes.data} /> : <SetupRequired reason={notes.reason} />}
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 font-extrabold text-foreground">تکنسین مسئول</h2>
            {assignment.ok && technicians.ok ? (
              <AssignmentPanel
                requestId={item.id}
                appliance={item.appliance}
                current={assignment.data}
                technicians={technicians.data}
                canUnassign={staff.role === "manager"}
                closed={item.status === "completed" || item.status === "cancelled"}
              />
            ) : (
              <SetupRequired reason={!assignment.ok ? assignment.reason : !technicians.ok ? technicians.reason : "failed"} />
            )}
            {assignmentEvents.ok && assignmentEvents.data.length > 0 && (
              <div className="mt-5 border-t border-border pt-4">
                <h3 className="mb-3 text-xs font-semibold text-muted">تاریخچهٔ تخصیص</h3>
                <AssignmentHistory events={assignmentEvents.data} />
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 font-extrabold text-foreground">تغییر وضعیت</h2>
            <StatusForm requestId={item.id} currentStatus={item.status} options={options} />
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 font-extrabold text-foreground">یادداشت داخلی</h2>
            <NoteForm requestId={item.id} />
          </section>
        </div>
      </div>
    </>
  );
}
