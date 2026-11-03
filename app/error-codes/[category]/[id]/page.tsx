
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getErrorCodeCategory } from "@/data/error-codes/categories";
import { VerificationBadge } from "@/components/error-codes/verification-badge";
import { getPublishedErrorCodes } from "@/lib/error-codes/queries";
import { siteConfig } from "@/lib/site";

type Props = {
  params: Promise<{ category: string; id: string }>;
};

export const revalidate = 300;

async function getErrorCode(category: string, id: string) {
  const rows = await getPublishedErrorCodes(category);
  return rows.find((row) => row.id === id) ?? null;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { category, id } = await params;
  const c = getErrorCodeCategory(category);

  if (!c) return {};

  const item = await getErrorCode(category, id);

  if (!item) return {};

  const title = `${item.error_code} ${item.title} ${item.brand}`;
  const description = `${item.meaning.slice(0, 145)} | راهنمای کدهای خطای ${c.title}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/error-codes/${category}/${id}`,
    },
    robots:
      item.verification_level === "verified"
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: {
      type: "article",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title,
      description,
      url: `/error-codes/${category}/${id}`,
    },
  };
}

export default async function ErrorCodeDetailPage({ params }: Props) {
  const { category, id } = await params;
  const c = getErrorCodeCategory(category);

  if (!c) notFound();

  const item = await getErrorCode(category, id);

  if (!item) notFound();

  const verified = item.verification_level === "verified";

  return (
    <main dir="rtl" className="page-container flex-1 py-5 sm:py-8">
      <nav
        aria-label="مسیر صفحه"
        className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted sm:text-sm"
      >
        <Link href="/" className="hover:text-primary">
          صفحه اصلی
        </Link>
        <span>/</span>
        <Link href="/error-codes" className="hover:text-primary">
          راهنمای کدهای خطا
        </Link>
        <span>/</span>
        <Link
          href={`/error-codes/${category}`}
          className="hover:text-primary"
        >
          {c.title}
        </Link>
        <span>/</span>
        <span className="font-bold text-foreground">
          {item.error_code}
        </span>
      </nav>

      <article className="mx-auto max-w-4xl">
        <header className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
          <div className="bg-gradient-to-l from-[#0F4C81] to-[#17699B] p-6 text-white sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold">
                راهنمای تخصصی کد خطا
              </span>
              <VerificationBadge
                    level={
                        item.verification_level === "verified"
                        ? "verified"
                        : "partially_verified"
                    }
              />
            </div>

            <p className="mt-7 text-sm font-medium text-white/75">
              {item.brand}
              {item.model ? ` · ${item.model}` : ""}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <h1 className="text-3xl font-black sm:text-5xl">
                خطای {item.error_code}
              </h1>
              <span className="rounded-xl bg-white/15 px-4 py-2 text-sm font-bold">
                {c.title}
              </span>
            </div>

            <p className="mt-4 text-lg font-bold leading-9 text-white/95">
              {item.title}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3">
            <div className="bg-white p-4">
              <p className="text-xs text-muted">دستگاه</p>
              <p className="mt-1 font-bold text-foreground">{c.title}</p>
            </div>
            <div className="bg-white p-4">
              <p className="text-xs text-muted">برند</p>
              <p className="mt-1 font-bold text-foreground">{item.brand}</p>
            </div>
            <div className="col-span-2 bg-white p-4 sm:col-span-1">
              <p className="text-xs text-muted">مدل دستگاه</p>
              <p className="mt-1 font-bold text-foreground">
                {item.model || "مدل مشخص نشده"}
              </p>
            </div>
          </div>
        </header>

        {!verified && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
            <strong>توجه:</strong> این اطلاعات به‌صورت نیمه‌تأییدشده
            منتشر شده است. معنی و راهکار خطا ممکن است با توجه به مدل
            دستگاه متفاوت باشد. پیش از اقدام، دفترچه راهنمای دستگاه
            را بررسی کنید.
          </div>
        )}

        <section className="mt-7 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-black text-[#0F4C81]">
            معنی خطای {item.error_code} چیست؟
          </h2>
          <p className="mt-4 text-sm leading-9 text-slate-700 sm:text-base">
            {item.meaning}
          </p>
        </section>

        {item.possible_causes.length > 0 && (
          <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-black text-foreground">
              علت‌های احتمالی بروز خطا
            </h2>
            <ul className="mt-4 space-y-3">
              {item.possible_causes.map((cause, index) => (
                <li
                  key={`${item.id}-cause-${index}`}
                  className="flex items-start gap-3 text-sm leading-8 text-slate-700"
                >
                  <span className="mt-3 size-2 shrink-0 rounded-full bg-teal-500" />
                  {cause}
                </li>
              ))}
            </ul>
          </section>
        )}

        {item.safe_steps.length > 0 && (
          <section className="mt-5 rounded-2xl border border-teal-200 bg-teal-50/60 p-5 sm:p-7">
            <h2 className="text-lg font-black text-teal-950">
              اقدامات اولیه و ایمن
            </h2>
            <ul className="mt-4 space-y-3">
              {item.safe_steps.map((step, index) => (
                <li
                  key={`${item.id}-step-${index}`}
                  className="flex items-start gap-3 text-sm leading-8 text-teal-950/85"
                >
                  <span className="mt-3 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-7">
          <h2 className="font-black text-amber-950">
            نکات مهم ایمنی
          </h2>
          <p className="mt-3 text-sm leading-8 text-amber-950/90">
            اگر دستگاه بوی سوختگی دارد، نشتی آب یا گاز مشاهده می‌کنید،
            یا احتمال خطر برق‌گرفتگی وجود دارد، دستگاه را از استفاده
            خارج کنید. از باز کردن قطعات داخلی و انجام تعمیرات تخصصی
            بدون مهارت و ابزار مناسب خودداری کنید.
          </p>
        </section>

        {item.source_name && (
          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-7 text-muted">
            منبع اطلاعات:{" "}
            {item.source_url ? (
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary underline underline-offset-4"
              >
                {item.source_name}
              </a>
            ) : (
              <strong>{item.source_name}</strong>
            )}
          </p>
        )}

        <section className="mt-8 rounded-3xl bg-[#0F4C81] p-6 text-center text-white sm:p-9">
          <h2 className="text-xl font-black sm:text-2xl">
            برای رفع خطای دستگاه به کمک نیاز دارید؟
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/80">
            برای بررسی و تعمیر تخصصی دستگاه خود با استادکاران در ارتباط باشید.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`${c.serviceHref}`}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0F4C81] hover:bg-slate-100"
            >
              خدمات تعمیر {c.title}
            </Link>
            <Link
              href="/repair-request"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#F59E0B] px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400"
            >
              ثبت درخواست تعمیر
            </Link>
          </div>
        </section>

        <div className="mt-7 text-center">
          <Link
            href={`/error-codes/${category}`}
            className="text-sm font-bold text-primary hover:text-teal-700"
          >
            ← بازگشت به فهرست کدهای خطای {c.title}
          </Link>
        </div>
      </article>
    </main>
  );
}
