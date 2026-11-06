
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getErrorCodeCategory } from "@/data/error-codes/categories";
import { categoryBanners } from "@/data/error-codes/category-images";
import { CategoryMedia } from "@/components/error-codes/category-media";
import { VerificationBadge } from "@/components/error-codes/verification-badge";
import { getPublishedErrorCodes } from "@/lib/error-codes/queries";
import { selectCategoryPageRows } from "@/lib/error-codes/visibility";
import { siteConfig } from "@/lib/site";

type Props = { params: Promise<{ category: string }> };

// Database-backed page: rendered on the first request (not at build time, so a database outage cannot fail the
// build) and refreshed at most every 5 minutes. A record that is unpublished or downgraded therefore leaves
// the public page within about that time.
export const revalidate = 300;

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { category: id } = await params;
  const c = getErrorCodeCategory(id);
  if (!c) return {};

  // Thin pages stay out of search results: indexable only with enough public codes. If the database
  // cannot be read, stay on the safe side and do not index.
  let indexable = false;
  try {
    indexable = selectCategoryPageRows(await getPublishedErrorCodes(id)).indexable;
  } catch {
    indexable = false;
  }

  // The root layout appends the site name through its title template, so it is not repeated here.
  const title = `راهنمای خطاهای ${c.title}`;

  return {
    title,
    description: c.description,
    alternates: { canonical: `/error-codes/${c.id}` },
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      type: "article",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: `${title} | ${siteConfig.name}`,
      description: c.description,
      url: `/error-codes/${c.id}`,
    },
  };
}

export default async function ErrorCodeCategoryPage({ params }: Props) {
  const { category: id } = await params;
  const c = getErrorCodeCategory(id);
  if (!c) notFound();

  const banner = categoryBanners[id];

  // Public codes (verified and partially verified, each with its badge); indexing is decided in generateMetadata.
  const { rows: errorCodes } = selectCategoryPageRows(await getPublishedErrorCodes(id));

  return (
    <main dir="rtl" className="page-container flex-1 py-5 sm:py-8">
      <nav aria-label="مسیر صفحه" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted sm:text-sm">
        <Link href="/" className="hover:text-primary">صفحه اصلی</Link>
        <span>/</span>
        <Link href="/error-codes" className="hover:text-primary">راهنمای کدهای خطا</Link>
        <span>/</span>
        <span className="font-bold text-foreground">{c.title}</span>
      </nav>

      {/* One banner component: the picture fills the header and the title block sits on it (from lg up, on the
          picture's empty side; on smaller screens it overlaps a fade at the picture's bottom so the appliance stays
          fully visible). All text is real HTML. */}
      <header
        className={`relative isolate overflow-hidden rounded-3xl border border-border border-b-4 bg-white shadow-sm lg:flex lg:min-h-[20rem] ${banner?.accent ?? "border-b-primary/40"}`}
      >
        <div className="relative h-60 w-full sm:h-72 lg:absolute lg:inset-0 lg:h-auto">
          {banner ? (
            <Image
              src={banner.src}
              alt={`بنر راهنمای خطاهای ${c.title}`}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className={`object-cover ${banner.objectClass}`}
            />
          ) : (
            <CategoryMedia categoryId={id} title={c.title} priority sizes="(max-width: 1280px) 100vw, 1200px" className="h-full w-full" />
          )}
          {/* Readability layer: fades to white at the bottom (small screens) or toward the text side (lg+). */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-white via-white/55 via-35% to-transparent lg:bg-gradient-to-l lg:from-white/95 lg:via-white/80 lg:via-45% lg:to-transparent lg:to-75%"
          />
        </div>

        <div className="relative -mt-14 p-6 pt-0 sm:-mt-16 sm:p-8 sm:pt-0 lg:mt-0 lg:flex lg:w-[58%] lg:flex-col lg:justify-center lg:p-10">
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-primary">
            مرکز راهنمای کدهای خطا
          </span>
          <h1 className="mt-4 text-2xl font-black leading-relaxed text-[#0F4C81] sm:text-4xl">
            راهنمای خطاهای {c.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-8 text-slate-700 sm:text-base">
            {c.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["معنی کد خطا", "علت‌های احتمالی", "اقدامات ایمن"].map((label) => (
              <span key={label} className="rounded-xl border border-border bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl py-8 sm:py-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-wide text-teal-700">راهنمای دستگاه</p>
            <h2 className="mt-1 text-xl font-black text-foreground sm:text-2xl">
              کدهای خطای {c.title}
            </h2>
          </div>
          <p className="text-sm leading-7 text-muted">
            همیشه برند و مدل دستگاه را تطبیق دهید.
          </p>
        </div>

        {errorCodes.length > 0 ? (
          <div className="grid gap-4">
            {errorCodes.map((item) => (
              <details
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition duration-200 hover:border-sky-200 hover:shadow-md"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-16 rounded-xl bg-sky-50 px-3 py-2 text-center text-sm font-black text-primary">
                    {item.error_code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-xs text-muted">
                      برند: {item.brand}
                      {item.model ? ` · مدل: ${item.model}` : ""}
                      {item.model_reference ? ` · مرجع مدل: ${item.model_reference}` : ""}
                    </p>
                    <p className="mt-2">
                      <VerificationBadge level={item.verification_level === "verified" ? "verified" : "partially_verified"} />
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-primary group-open:bg-teal-50 group-open:text-teal-800">
                    <span className="group-open:hidden">مشاهده جزئیات +</span>
                    <span className="hidden group-open:inline">بستن −</span>
                  </span>
                </summary>

                <div className="border-t border-border bg-slate-50/60 p-4 sm:p-6">
                  <p className="text-sm leading-8 text-slate-700">{item.meaning}</p>
                  <div className="mt-4">
                    <Link
                      href={`/error-codes/${id}/${item.id}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
                    >
                      مطالعه راهنمای کامل این خطا
                      <span aria-hidden="true">←</span>
                    </Link>
                  </div>

                  {item.possible_causes?.length > 0 && (
                    <div className="mt-5">
                      <h4 className="font-extrabold text-foreground">علت‌های احتمالی</h4>
                      <ul className="mt-2 space-y-2">
                        {item.possible_causes.map((cause, index) => (
                          <li key={`${item.id}-cause-${index}`} className="flex gap-2 text-sm leading-7 text-muted">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-500" />
                            {cause}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.safe_steps?.length > 0 && (
                    <div className="mt-5 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
                      <h4 className="font-extrabold text-teal-900">اقدامات اولیه ایمن</h4>
                      <ul className="mt-2 space-y-2">
                        {item.safe_steps.map((step, index) => (
                          <li key={`${item.id}-step-${index}`} className="flex gap-2 text-sm leading-7 text-teal-950/80">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-600" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.source_name && (
                    <p className="mt-4 border-t border-border pt-3 text-xs leading-6 text-muted">
                      منبع:{" "}
                      {item.source_url ? (
                        <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-4">
                          {item.source_name}
                        </a>
                      ) : item.source_name}
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm sm:p-9">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-2xl text-primary">i</span>
              <div>
                <h3 className="text-lg font-extrabold text-foreground">
                  راهنمای این دسته در حال تکمیل است
                </h3>
                <p className="mt-2 text-sm leading-8 text-muted">
                  هنوز کد تأییدشده‌ای برای نمایش عمومی در این دسته نداریم.
                  برای جلوگیری از راهنمایی اشتباه، اطلاعات بررسی‌نشده نمایش داده نمی‌شوند.
                </p>
                <Link href="/repair-request" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90">
                  درخواست راهنمایی و تعمیر
                </Link>
              </div>
            </div>
          </div>
        )}

        <aside className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <h2 className="font-extrabold text-amber-950">نکات مهم ایمنی</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-amber-950/90">
            <li>کد خطا را دقیقاً مطابق نمایشگر دستگاه یادداشت کنید.</li>
            <li>برند و شماره مدل را از برچسب مشخصات یا دفترچه راهنما بررسی کنید.</li>
            <li>در صورت نشتی، بوی سوختگی یا خطر برق و گاز، از بررسی داخلی دستگاه خودداری کنید.</li>
          </ul>
        </aside>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href={c.serviceHref} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90">
            خدمات تعمیر {c.title}
          </Link>
          <Link href="/repair-request" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-white px-5 py-3 text-sm font-bold text-foreground hover:border-primary/40">
            ثبت درخواست تعمیر
          </Link>
          <Link href="/error-codes" className="inline-flex min-h-12 items-center justify-center px-4 py-3 text-sm font-bold text-primary hover:text-accent-strong">
            بازگشت به راهنمای کدهای خطا
          </Link>
        </div>
      </section>
    </main>
  );
}
