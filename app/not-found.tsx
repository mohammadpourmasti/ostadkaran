import type { Metadata } from "next";
import Link from "next/link";
import { PhoneCta } from "@/components/ui/phone-cta";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center">
      <div className="page-container py-16 text-center">
        <p className="text-5xl font-extrabold text-accent">۴۰۴</p>
        <h1 className="mt-3 text-2xl font-extrabold text-primary">صفحه‌ای که دنبالش بودید پیدا نشد</h1>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-2xl border-[1.5px] border-primary px-6 text-[0.9375rem] font-semibold text-primary hover:bg-primary/5"
          >
            بازگشت به صفحه اصلی
          </Link>
          <PhoneCta variant="outline" />
        </div>
      </div>
    </main>
  );
}
