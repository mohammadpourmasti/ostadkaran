$ErrorActionPreference = "Stop"
$root = (Get-Location).Path
if (!(Test-Path "data\services.ts") -or !(Test-Path "app\page.tsx")) { throw "Run from G:\Projects\ostadkaran." }

$dirs = @("app\error-codes","app\error-codes\[category]","components\error-codes","data\error-codes")
foreach ($dir in $dirs) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

function Write-Utf8File([string]$Path, [string]$Content) {
  $parent = Split-Path $Path -Parent
  New-Item -ItemType Directory -Force -Path $parent | Out-Null
  [System.IO.File]::WriteAllText((Join-Path $root $Path), $Content, [System.Text.UTF8Encoding]::new($false))
  Write-Host "Created: $Path"
}

Write-Utf8File "data\error-codes\categories.ts" @'
import { services, servicePath } from "@/data/services";

const copy: Record<string, { title: string; description: string; keywords: string[] }> = {
  "washing-machine": { title: "ماشین لباسشویی", description: "راهنمای کدهای خطا و پیام‌های هشدار ماشین لباسشویی؛ معنی هر کد به برند و مدل دستگاه بستگی دارد.", keywords: ["لباسشویی", "ماشین لباسشویی", "washer"] },
  refrigerator: { title: "یخچال و فریزر", description: "راهنمای پیام‌های هشدار یخچال و فریزر و نکاتی برای بررسی ایمن دستگاه.", keywords: ["یخچال", "فریزر", "refrigerator", "fridge"] },
  dishwasher: { title: "ماشین ظرفشویی", description: "راهنمای کدهای خطای ماشین ظرفشویی و بررسی‌های اولیه و ایمن.", keywords: ["ظرفشویی", "ماشین ظرفشویی", "dishwasher"] },
  television: { title: "تلویزیون", description: "راهنمای پیام‌ها و نشانه‌های خطای تلویزیون؛ نشانه‌ها ممکن است بین مدل‌ها متفاوت باشند.", keywords: ["تلویزیون", "tv", "television"] },
  stove: { title: "اجاق گاز و فر", description: "راهنمای هشدارهای اجاق گاز و فر با تأکید بر نکات ایمنی.", keywords: ["اجاق", "اجاق گاز", "فر", "oven", "stove"] },
  "vacuum-cleaner": { title: "جاروبرقی و جارو شارژی", description: "راهنمای نشانگرها و پیام‌های خطای جاروبرقی و جارو شارژی.", keywords: ["جاروبرقی", "جارو شارژی", "vacuum"] },
  "air-conditioner": { title: "کولر گازی", description: "راهنمای کدهای نمایش‌داده‌شده روی کولر گازی؛ معنی کدها به برند و مدل وابسته است.", keywords: ["کولر گازی", "اسپلیت", "air conditioner", "ac"] },
  other: { title: "سایر لوازم خانگی", description: "برای وسیله‌های دیگر، نوع دستگاه و کد یا نشانه‌ای را که می‌بینید یادداشت کنید.", keywords: ["سایر", "لوازم خانگی", "other"] },
};

export const errorCodeCategories = services.map((service) => ({
  ...(copy[service.id] ?? { title: service.navTitle, description: `راهنمای خطاهای ${service.navTitle}؛ معنی کدها را با توجه به برند و مدل بررسی کنید.`, keywords: [service.navTitle] }),
  id: service.id,
  serviceHref: servicePath(service),
}));

export function getErrorCodeCategory(id: string) {
  return errorCodeCategories.find((category) => category.id === id);
}
'@

Write-Utf8File "components\error-codes\error-code-guide.tsx" @'
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { errorCodeCategories } from "@/data/error-codes/categories";

const symbols: Record<string, string> = {
  "washing-machine": "◉", refrigerator: "▯", dishwasher: "▤", television: "▣",
  stove: "♨", "vacuum-cleaner": "⌁", "air-conditioner": "❄", other: "•••",
};

export function ErrorCodeGuide() {
  const [query, setQuery] = useState("");
  const categories = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return errorCodeCategories;
    return errorCodeCategories.filter((c) =>
      [c.title, ...c.keywords, c.id].some((v) => v.toLocaleLowerCase().includes(q)),
    );
  }, [query]);

  return <>
    <section className="border-b border-border bg-gradient-to-l from-sky-50 via-white to-teal-50">
      <div className="page-container grid items-center gap-8 py-9 sm:py-14 lg:grid-cols-[1fr_0.8fr] lg:gap-12">
        <div>
          <p className="inline-flex rounded-full border border-accent/25 bg-white px-3 py-1.5 text-sm font-bold text-accent-strong">راهنمای کاربردی استادکاران</p>
          <h1 className="mt-4 text-3xl font-black leading-relaxed text-primary sm:text-4xl lg:text-5xl">راهنمای کدهای خطا<span className="block text-2xl sm:text-3xl">لوازم خانگی</span></h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted">کد خطا یا نام دستگاه را جست‌وجو کنید و راهنمای مربوط به وسیله‌تان را پیدا کنید. معنی کدها ممکن است با توجه به برند و مدل متفاوت باشد.</p>
          <label htmlFor="error-code-search" className="sr-only">جست‌وجوی نوع وسیله یا کد خطا</label>
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-white p-2 shadow-lg shadow-primary/5 focus-within:border-accent">
            <span aria-hidden="true" className="px-2 text-xl text-muted">⌕</span>
            <input id="error-code-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="نام وسیله را جست‌وجو کنید، مثلاً یخچال" className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-foreground outline-none placeholder:text-muted/80 sm:text-base" />
            {query && <button type="button" onClick={() => setQuery("")} className="rounded-xl px-3 py-2 text-sm font-bold text-primary hover:bg-primary/5">پاک‌کردن</button>}
          </div>
          <p className="mt-3 text-xs leading-6 text-muted">برای شناسایی دقیق کد، برند و شماره مدل دستگاه را هم بررسی کنید.</p>
        </div>
        <div aria-hidden="true" className="relative mx-auto grid min-h-52 w-full max-w-lg grid-cols-2 gap-3 sm:gap-4">
          <div className="flex min-h-28 flex-col items-center justify-center rounded-3xl border border-sky-100 bg-white/90 p-4 shadow-sm"><span className="text-5xl text-primary">▯</span><span className="mt-2 text-sm font-bold">یخچال</span></div>
          <div className="mt-7 flex min-h-28 flex-col items-center justify-center rounded-3xl border border-teal-100 bg-white/90 p-4 shadow-sm"><span className="text-5xl text-accent-strong">◉</span><span className="mt-2 text-sm font-bold">لباسشویی</span></div>
          <div className="-mt-3 flex min-h-28 flex-col items-center justify-center rounded-3xl border border-amber-100 bg-white/90 p-4 shadow-sm"><span className="text-5xl text-amber-600">▣</span><span className="mt-2 text-sm font-bold">تلویزیون</span></div>
          <div className="flex min-h-28 flex-col items-center justify-center rounded-3xl border border-violet-100 bg-white/90 p-4 shadow-sm"><span className="text-5xl text-violet-600">⌁</span><span className="mt-2 text-sm font-bold">جاروبرقی</span></div>
        </div>
      </div>
    </section>

    <section className="page-container py-10 sm:py-14">
      <div className="mx-auto max-w-3xl text-center"><h2 className="text-2xl font-black text-foreground sm:text-3xl">دسته‌بندی وسایل</h2><p className="mt-3 text-sm leading-7 text-muted sm:text-base">وسیله موردنظرتان را انتخاب کنید تا راهنمای مرتبط را ببینید.</p></div>
      {categories.length ? <div className="mt-7 grid grid-cols-1 gap-4 sm:mt-9 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c, i) => <article key={c.id} className="group flex min-h-52 flex-col rounded-2xl border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg">
          <div className="flex items-start justify-between gap-3"><span className={`flex size-12 items-center justify-center rounded-2xl text-2xl ${["bg-teal-50 text-teal-700","bg-sky-50 text-sky-700","bg-amber-50 text-amber-700","bg-violet-50 text-violet-700"][i%4]}`}>{symbols[c.id] ?? "•"}</span><span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-muted">راهنما</span></div>
          <h3 className="mt-4 text-lg font-extrabold text-foreground">{c.title}</h3><p className="mt-2 flex-1 text-sm leading-7 text-muted">{c.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3"><Link href={`/error-codes/${c.id}`} className="text-sm font-bold text-primary hover:text-accent-strong">مشاهده راهنما ←</Link><Link href={c.serviceHref} className="text-sm font-medium text-muted underline-offset-4 hover:text-primary hover:underline">صفحه تعمیر</Link></div>
        </article>)}
      </div> : <div className="mt-8 rounded-2xl border border-border bg-white p-8 text-center"><p className="font-bold">دسته‌ای پیدا نشد.</p><button onClick={() => setQuery("")} className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white">نمایش همه دسته‌ها</button></div>}
    </section>

    <section className="page-container pb-10 sm:pb-14"><div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-5 sm:p-8"><h2 className="text-center text-xl font-extrabold text-primary sm:text-2xl">چطور از راهنما استفاده کنیم؟</h2><div className="mt-6 grid gap-5 sm:grid-cols-3 sm:gap-6">
      {[{n:"۱",t:"وسیله را انتخاب کنید",d:"دسته‌بندی متناسب با دستگاهتان را باز کنید."},{n:"۲",t:"برند و مدل را بررسی کنید",d:"کدهای مشابه ممکن است در مدل‌های مختلف معنی متفاوتی داشته باشند."},{n:"۳",t:"ایمنی را در اولویت بگذارید",d:"اگر بررسی نیازمند بازکردن دستگاه یا کار برقی و گازی است، ادامه ندهید."}].map((s)=><div key={s.n} className="flex gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white font-black text-accent-strong shadow-sm">{s.n}</span><div><h3 className="font-bold text-foreground">{s.t}</h3><p className="mt-1 text-sm leading-7 text-muted">{s.d}</p></div></div>)}
    </div></div></section>

    <section className="page-container pb-12 sm:pb-16"><div className="flex flex-col gap-5 rounded-3xl bg-gradient-to-l from-primary to-teal-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8"><div><h2 className="text-xl font-extrabold sm:text-2xl">برای بررسی دستگاه به کمک نیاز دارید؟</h2><p className="mt-2 text-sm leading-7 text-white/85">در صورت تداوم خطا، برای راهنمایی یا ثبت درخواست تعمیر اقدام کنید.</p></div><Link href="/repair-request" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-primary hover:bg-sky-50">ثبت درخواست تعمیر ←</Link></div></section>
  </>;
}
'@

Write-Utf8File "app\error-codes\page.tsx" @'
import type { Metadata } from "next";
import Link from "next/link";
import { ErrorCodeGuide } from "@/components/error-codes/error-code-guide";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "راهنمای کدهای خطای لوازم خانگی | استادکاران اراک",
  description: "راهنمای کدهای خطا و پیام‌های هشدار لوازم خانگی. نوع وسیله را انتخاب کنید و پیش از هر اقدامی، نکات ایمنی و تفاوت کدها بر اساس برند و مدل را بررسی کنید.",
  alternates: { canonical: "/error-codes" },
  openGraph: { type: "website", locale: siteConfig.locale, siteName: siteConfig.name, title: "راهنمای کدهای خطای لوازم خانگی | استادکاران", description: "جست‌وجو و راهنمایی اولیه برای کدهای خطای لوازم خانگی، با توجه به برند و مدل دستگاه.", url: "/error-codes" },
};

export default function ErrorCodesPage() {
  return <main className="flex-1"><div className="page-container pt-4"><nav aria-label="مسیر صفحه" className="text-sm text-muted"><Link href="/" className="hover:text-primary">صفحه اصلی</Link><span className="mx-2" aria-hidden="true">/</span><span className="font-semibold text-foreground">راهنمای کدهای خطا</span></nav></div><ErrorCodeGuide /></main>;
}
'@

Write-Utf8File "app\error-codes\[category]\page.tsx" @'
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getErrorCodeCategory, errorCodeCategories } from "@/data/error-codes/categories";
import { siteConfig } from "@/lib/site";

type Props = { params: Promise<{ category: string }> };
export function generateStaticParams() { return errorCodeCategories.map((c) => ({ category: c.id })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: id } = await params;
  const c = getErrorCodeCategory(id);
  if (!c) return {};
  return {
    title: `راهنمای خطاهای ${c.title} | استادکاران`,
    description: c.description,
    alternates: { canonical: `/error-codes/${c.id}` },
    openGraph: { type: "article", locale: siteConfig.locale, siteName: siteConfig.name, title: `راهنمای خطاهای ${c.title} | استادکاران`, description: c.description, url: `/error-codes/${c.id}` },
  };
}

export default async function ErrorCodeCategoryPage({ params }: Props) {
  const { category: id } = await params;
  const c = getErrorCodeCategory(id);
  if (!c) notFound();
  return <main className="page-container flex-1 py-8 sm:py-12">
    <nav aria-label="مسیر صفحه" className="text-sm text-muted"><Link href="/" className="hover:text-primary">صفحه اصلی</Link><span className="mx-2">/</span><Link href="/error-codes" className="hover:text-primary">راهنمای کدهای خطا</Link><span className="mx-2">/</span><span className="font-semibold text-foreground">{c.title}</span></nav>
    <header className="mt-7 rounded-3xl border border-border bg-gradient-to-l from-sky-50 to-teal-50 p-6 sm:p-10"><p className="text-sm font-bold text-accent-strong">راهنمای کدهای خطا</p><h1 className="mt-3 text-2xl font-black leading-relaxed text-primary sm:text-4xl">راهنمای خطاهای {c.title}</h1><p className="mt-4 max-w-3xl text-sm leading-8 text-muted sm:text-base">{c.description}</p></header>
    <section className="mx-auto max-w-3xl py-8 sm:py-10"><h2 className="text-xl font-extrabold text-foreground">برای تفسیر دقیق کد چه اطلاعاتی لازم است؟</h2>
      <ul className="mt-4 list-inside list-disc space-y-3 text-sm leading-8 text-muted sm:text-base"><li>کد یا پیام را دقیقاً همان‌طور که روی نمایشگر دیده می‌شود یادداشت کنید.</li><li>برند و شماره مدل دستگاه را از برچسب مشخصات یا دفترچه راهنما پیدا کنید.</li><li>اگر دستگاه بوی سوختگی می‌دهد، نشتی دارد یا نشانه خطر برقی یا گازی دیده می‌شود، آن را خاموش کنید و از بررسی داخلی خودداری کنید.</li></ul>
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-extrabold text-amber-900">درباره فهرست کدها</h3><p className="mt-2 text-sm leading-7 text-amber-900/90">فهرست کدهای این دسته در حال تکمیل و راستی‌آزمایی بر اساس برند و مدل است. برای جلوگیری از راهنمایی اشتباه، کد تأییدنشده به‌عنوان تشخیص قطعی نمایش داده نمی‌شود.</p></div>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href={c.serviceHref} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90">مشاهده خدمات تعمیر {c.title}</Link><Link href="/repair-request" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-white px-5 py-3 text-sm font-bold text-foreground hover:border-primary/40">ثبت درخواست تعمیر</Link><Link href="/error-codes" className="inline-flex min-h-12 items-center justify-center px-4 py-3 text-sm font-bold text-primary hover:text-accent-strong">بازگشت به راهنما</Link></div>
    </section>
  </main>;
}
'@

# Add a header navigation item, anchored by the ASCII-only contact hash line.
$navPath = Join-Path $root "data\navigation.ts"
$nav = [System.IO.File]::ReadAllText($navPath, [System.Text.Encoding]::UTF8)
if ($nav -notmatch 'href:\s*"/error-codes"') {
  $pattern = '(?m)^(\s*\{ label: .*href: `/#\$\{sectionIds\.contact\}` \},\s*)$'
  $replacement = '$1' + "`r`n  { label: `"راهنمای کدهای خطا`", href: `"/error-codes`" },"
  $updated = [regex]::Replace($nav, $pattern, $replacement, 1)
  if ($updated -eq $nav) { Write-Warning "Pages created, but navigation link could not be auto-added. Add { label: 'راهنمای کدهای خطا', href: '/error-codes' } to mainNavigation." }
  else { [System.IO.File]::WriteAllText($navPath, $updated, [System.Text.UTF8Encoding]::new($false)); Write-Host "Updated: data\navigation.ts" }
} else { Write-Host "Navigation link already exists." }

Write-Host "`nGuide pages created. Nothing was deployed."
Write-Host "Next command: npm run build"
