import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { TechnicianForm } from "@/components/admin/technician-form";
import { requireManager } from "@/lib/admin/require-manager";

export const metadata: Metadata = { title: "افزودن تکنسین" };
export const dynamic = "force-dynamic";

export default async function NewTechnicianPage() {
  await requireManager();

  return (
    <>
      <Link href="/admin/staff" className="mb-4 inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-accent">
        → بازگشت به کارکنان
      </Link>
      <PageHeader title="افزودن تکنسین" description="حساب ورود و پروفایل تکنسین با هم ساخته می‌شوند؛ اگر یکی از مراحل شکست بخورد، حساب ناقص نمی‌ماند." />
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        <TechnicianForm mode="create" />
      </section>
    </>
  );
}
