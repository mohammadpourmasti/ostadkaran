"use client";

import { PhoneCta } from "@/components/ui/phone-cta";

export default function Error({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <main className="flex flex-1 items-center">
      <div className="page-container py-16 text-center">
        <h1 className="text-2xl font-extrabold text-primary">مشکلی پیش آمد</h1>
        <p className="mt-2 text-sm/7 text-muted">لطفاً دوباره تلاش کنید. اگر مشکل ادامه داشت، تماس بگیرید.</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex h-12 items-center justify-center rounded-2xl border-[1.5px] border-primary px-6 text-[0.9375rem] font-semibold text-primary hover:bg-primary/5"
          >
            تلاش دوباره
          </button>
          <PhoneCta variant="outline" />
        </div>
      </div>
    </main>
  );
}
