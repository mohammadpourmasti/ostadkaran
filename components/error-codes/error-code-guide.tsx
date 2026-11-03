
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { errorCodeCategories } from "@/data/error-codes/categories";
import type { ErrorCodeSearchItem } from "@/lib/error-codes/types";
import { CategoryMedia } from "./category-media";
import { VerificationBadge } from "./verification-badge";

const symbols: Record<string, string> = {
  "washing-machine": "◉",
  refrigerator: "▯",
  dishwasher: "▤",
  television: "▣",
  stove: "♨",
  "vacuum-cleaner": "⌁",
  "air-conditioner": "❄",
  other: "•••",
};

type ErrorCodeResult = ErrorCodeSearchItem;

export function ErrorCodeGuide() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ErrorCodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  // A search is only active for 2+ characters. When it stops being active, the search state is reset while
  // rendering (React's "adjust state when a value changes" pattern) instead of inside an effect.
  const searchActive = query.trim().length >= 2;
  const [wasSearchActive, setWasSearchActive] = useState(false);

  if (searchActive !== wasSearchActive) {
    setWasSearchActive(searchActive);

    if (!searchActive) {
      setResults([]);
      setSearching(false);
      setSearchError(false);
    }
  }

  useEffect(() => {
    const q = query.trim();

    // Nothing to fetch; the state reset for this case happens during render above.
    if (q.length < 2) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError(false);

      try {
        const response = await fetch(
          `/api/error-codes?q=${encodeURIComponent(q)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        setResults(data.results ?? []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setSearchError(true);
        setResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const categories = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();

    if (!q) return errorCodeCategories;

    return errorCodeCategories.filter((c) =>
      [c.title, ...c.keywords, c.id].some((v) =>
        v.toLocaleLowerCase().includes(q),
      ),
    );
  }, [query]);

  return (
    <>
      {/* بنر اصلی: تصویر پس‌زمینه و محتوا روی تصویر */}
      
{/* بنر اصلی: تصویر و محتوا در یک سکشن */}
<section dir="rtl" className="px-3 pt-4 sm:px-5 sm:pt-6">
  <div className="relative isolate mx-auto min-h-[420px] max-w-7xl overflow-hidden rounded-3xl bg-slate-100 sm:min-h-[440px] lg:min-h-[460px]">
    <Image
      src="/images/error-codes/error-codes-hero.png"
      alt="راهنمای کدهای خطای لوازم خانگی استادکاران"
     
      fill
      priority
      sizes="(max-width: 768px) 100vw, 1200px"
      className="object-cover object-center"
    />

    {/* لایه خوانایی متن روی تصویر */}
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 bg-gradient-to-l from-white/95 via-white/80 to-white/10"
    />

    {/* متن و جست‌وجو روی همان تصویر */}
    <div className="relative z-10 flex min-h-[420px] items-center px-5 py-8 sm:min-h-[440px] sm:px-10 lg:min-h-[460px] lg:px-14">
      <div className="w-full max-w-2xl px-5 sm:px-9 lg:px-12">
        <p className="text-sm font-bold text-[#0F4C81] sm:text-lg">
          راهنمای کامل و سریع
        </p>

        <h1 className="mt-2 text-3xl font-black leading-relaxed text-[#0F4C81] sm:text-4xl lg:text-5xl">
          کدهای خطای
          <span className="block text-[#14B8A6]">لوازم خانگی</span>
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
          کد خطا یا نام دستگاه را جست‌وجو کنید و راهنمای مربوط به وسیله‌تان را پیدا کنید.
          معنی کدها ممکن است با توجه به برند و مدل متفاوت باشد.
        </p>

        <label htmlFor="error-code-search" className="w-full max-w-lg">
          جست‌وجوی نوع وسیله یا کد خطا
        </label>

        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg focus-within:border-[#14B8A6]">
          <span aria-hidden="true" className="px-2 text-2xl text-[#0F4C81]">
            ⌕
          </span>

          <input
            id="error-code-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="نام وسیله یا کد خطا را وارد کنید"
            className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:text-base"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 rounded-xl px-3 py-2 text-sm font-bold text-[#0F4C81] hover:bg-sky-50"
            >
              پاک‌کردن
            </button>
          )}
        </div>

        <p className="mt-3 text-xs leading-6 text-[#0F4C81] sm:text-sm">
          برای شناسایی دقیق کد، برند و شماره مدل دستگاه را هم بررسی کنید.
        </p>
      </div>
    </div>
  </div>
</section>


      {/* نتایج جست‌وجو: خارج از بنر */}
      {query.trim().length >= 2 && (
        <section
          dir="rtl"
          aria-live="polite"
          aria-label="نتایج جست‌وجوی کد خطا"
          className="page-container pt-6"
        >
          <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
            <h2 className="text-lg font-extrabold text-foreground">
              نتایج جست‌وجو
            </h2>

            {searching ? (
              <p className="mt-4 text-sm text-muted">
                در حال جست‌وجو...
              </p>
            ) : searchError ? (
              <p className="mt-4 text-sm leading-7 text-muted">
                دریافت نتایج موقتاً ممکن نیست. لطفاً دوباره تلاش کنید.
              </p>
            ) : results.length > 0 ? (
              <div className="mt-4 space-y-3">
                {results.map((item) => {
                  const category = errorCodeCategories.find(
                    (c) => c.id === item.appliance_category,
                  );

                  return (
                    <article
                      key={item.id}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-primary px-3 py-1 text-sm font-black text-white">
                          {item.error_code}
                        </span>

                        <span className="text-sm font-bold text-foreground">
                          {item.brand}
                        </span>

                        {item.model && (
                          <span className="text-sm text-muted">
                            مدل: {item.model}
                          </span>
                        )}

                        <VerificationBadge level={item.verification_level} />
                      </div>

                      <h3 className="mt-3 font-extrabold text-foreground">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-muted">
                        {item.meaning}
                      </p>

                      {category && (
                        <Link
                          href={`/error-codes/${category.id}`}
                          className="mt-3 inline-flex text-sm font-bold text-primary hover:text-accent-strong"
                        >
                          مشاهده راهنمای {category.title} ←
                        </Link>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-muted">
                کد منتشرشده‌ای با این عبارت پیدا نشد. برند و کد را
                بررسی کنید یا دسته‌بندی دستگاه را انتخاب کنید.
              </p>
            )}
          </div>
        </section>
      )}

      {/* دسته‌بندی وسایل */}
      <section dir="rtl" className="page-container py-10 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">
            دسته‌بندی وسایل
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            وسیله موردنظرتان را انتخاب کنید تا راهنمای مرتبط را ببینید.
          </p>
        </div>

        {categories.length ? (
          <div className="mt-7 grid grid-cols-1 gap-4 sm:mt-9 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, i) => (
              <article
                key={c.id}
                className="group flex min-h-52 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg"
              >
                <CategoryMedia
                  categoryId={c.id}
                  title={c.title}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="aspect-[16/9] w-full"
                />
                <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex size-12 items-center justify-center rounded-2xl text-2xl ${
                      [
                        "bg-teal-50 text-teal-700",
                        "bg-sky-50 text-sky-700",
                        "bg-amber-50 text-amber-700",
                        "bg-violet-50 text-violet-700",
                      ][i % 4]
                    }`}
                  >
                    {symbols[c.id] ?? "•"}
                  </span>
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-muted">
                    راهنما
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-extrabold text-foreground">
                  {c.title}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-7 text-muted">
                  {c.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/error-codes/${c.id}`}
                    className="text-sm font-bold text-primary hover:text-accent-strong"
                  >
                    مشاهده راهنما ←
                  </Link>
                  <Link
                    href={c.serviceHref}
                    className="text-sm font-medium text-muted underline-offset-4 hover:text-primary hover:underline"
                  >
                    صفحه تعمیر
                  </Link>
                </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-border bg-white p-8 text-center">
            <p className="font-bold">دسته‌ای پیدا نشد.</p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white"
            >
              نمایش همه دسته‌ها
            </button>
          </div>
        )}
      </section>

      {/* راهنمای استفاده */}
      <section dir="rtl" className="page-container pb-10 sm:pb-14">
        <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-5 sm:p-8">
          <h2 className="text-center text-xl font-extrabold text-primary sm:text-2xl">
            چطور از راهنما استفاده کنیم؟
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-3 sm:gap-6">
            {[
              {
                n: "۱",
                t: "وسیله را انتخاب کنید",
                d: "دسته‌بندی متناسب با دستگاهتان را باز کنید.",
              },
              {
                n: "۲",
                t: "برند و مدل را بررسی کنید",
                d: "کدهای مشابه ممکن است در مدل‌های مختلف معنی متفاوتی داشته باشند.",
              },
              {
                n: "۳",
                t: "ایمنی را در اولویت بگذارید",
                d: "اگر بررسی نیازمند بازکردن دستگاه یا کار برقی و گازی است، ادامه ندهید.",
              },
            ].map((s) => (
              <div key={s.n} className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white font-black text-accent-strong shadow-sm">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-bold text-foreground">{s.t}</h3>
                  <p className="mt-1 text-sm leading-7 text-muted">
                    {s.d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* دعوت به ثبت درخواست تعمیر */}
      <section dir="rtl" className="page-container pb-12 sm:pb-16">
        <div className="flex flex-col gap-5 rounded-3xl bg-gradient-to-l from-primary to-teal-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-xl font-extrabold sm:text-2xl">
              برای بررسی دستگاه به کمک نیاز دارید؟
            </h2>
            <p className="mt-2 text-sm leading-7 text-white/85">
              در صورت تداوم خطا، برای راهنمایی یا ثبت درخواست تعمیر اقدام کنید.
            </p>
          </div>

          <Link
            href="/repair-request"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-primary hover:bg-sky-50"
          >
            ثبت درخواست تعمیر ←
          </Link>
        </div>
      </section>
    </>
  );
}
