import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FounderPhotoAlbum } from "@/components/about/founder-photo-album";
import { founderPhotos, founderVideos } from "@/data/founder-media";
import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons/icon-base";
import { CheckCircleIcon, ClockIcon, UserIcon, WrenchIcon } from "@/components/icons/ui-icons";
import { JsonLd } from "@/components/seo/json-ld";
import { PhoneCta } from "@/components/ui/phone-cta";
import { RepairRequestCta } from "@/components/ui/repair-request-cta";
import { siteConfig } from "@/lib/site";

const title = "بنیان‌گذار و مسئول فنی";
const description =
  "معرفی هانی حیدری، مدیرعامل، بنیان‌گذار و مسئول فنی استادکاران: ۳۲ سال سابقه در تعمیر و نصب لوازم خانگی، مدرس فنی و حرفه‌ای و کارشناس صدا و سیما؛ در اراک و استان مرکزی.";
const path = "/about/founder";
const founderName = "هانی حیدری";
const portrait = { src: "/images/founder/hani-heydari.jpg", width: 420, height: 525 };
const portraitAlt = `${founderName}، مدیرعامل، بنیان‌گذار و مسئول فنی استادکاران`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    type: "profile",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: `${title} | ${siteConfig.name}`,
    description,
    url: path,
    images: [{ url: portrait.src, width: portrait.width, height: portrait.height, alt: portraitAlt }],
  },
};

// Only facts confirmed by the client are used on this page (see siteConfig.business and the About section):
// name, managing director, founder and technical manager, 32 years in home-appliance repair and installation,
// vocational (فنی و حرفه‌ای) instructor, IRIB (صدا و سیما) expert. Nothing beyond these may be added without the
// client's confirmation.
const credentials: readonly { icon: ComponentType<IconProps>; title: string; text: string }[] = [
  {
    icon: UserIcon,
    title: "۳۲ سال سابقه",
    text: "سابقه در تعمیر و نصب لوازم خانگی.",
  },
  {
    icon: WrenchIcon,
    title: "مدرس فنی و حرفه‌ای",
    text: `از عناوین حرفه‌ای ${founderName}.`,
  },
  {
    icon: CheckCircleIcon,
    title: "کارشناس صدا و سیما",
    text: `از عناوین حرفه‌ای ${founderName}.`,
  },
];

const values: readonly { icon: ComponentType<IconProps>; title: string; text: string }[] = [
  {
    icon: WrenchIcon,
    title: "شفافیت در هزینه",
    text: "پیش‌فاکتور و اعلام هزینه پیش از شروع تعمیر.",
  },
  {
    icon: CheckCircleIcon,
    title: "ضمانت کتبی",
    text: "تعمیرات با ضمانت کتبی ۶ ماهه ارائه می‌شود.",
  },
  {
    icon: ClockIcon,
    title: "مسئولیت‌پذیری",
    text: `پاسخ‌گویی ${siteConfig.business.hours}، با ${siteConfig.business.duty}.`,
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: title, item: `${siteConfig.url}${path}` },
    ],
  },
  {
    // Describes the page and links the founder's person record to the existing business record.
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: title,
    description,
    url: `${siteConfig.url}${path}`,
    about: { "@id": `${siteConfig.url}/#business` },
    mainEntity: { "@id": `${siteConfig.url}${path}#person` },
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteConfig.url}${path}#person`,
    name: founderName,
    jobTitle: ["مدیرعامل", "بنیان‌گذار و مسئول فنی"],
    description: "مدرس فنی و حرفه‌ای، کارشناس صدا و سیما؛ ۳۲ سال سابقه در تعمیر و نصب لوازم خانگی.",
    image: `${siteConfig.url}${portrait.src}`,
    worksFor: { "@id": `${siteConfig.url}/#business` },
  },
];

export default function FounderPage() {
  return (
    <main className="flex-1">
      {jsonLd.map((data) => (
        <JsonLd key={String(data["@type"])} data={data} />
      ))}

      <div className="page-container py-5 sm:py-8">
        <nav aria-label="مسیر صفحه" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted sm:text-sm">
          <Link href="/" className="hover:text-primary">
            صفحه اصلی
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/#about" className="hover:text-primary">
            درباره ما
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-bold text-foreground">{title}</span>
        </nav>

        {/* Intro banner */}
        <header className="relative isolate overflow-hidden rounded-3xl bg-[#0F4C81] text-white shadow-sm lg:flex lg:min-h-[30rem] lg:items-center">
          <div className="relative h-64 sm:h-80 lg:absolute lg:inset-0 lg:h-auto">
            <Image
              src="/images/founder/founder-banner.jpg"
              alt={`${founderName}، مدیرعامل و مسئول فنی استادکاران، در کارگاه تعمیر لوازم خانگی`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1100px"
              className="object-cover [object-position:15%_30%] lg:[object-position:0%_40%]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F4C81] lg:bg-gradient-to-l lg:from-[#0F4C81] lg:via-[#0F4C81]/80 lg:via-[45%] lg:to-transparent lg:to-[75%]"
            />
          </div>
            <div className="relative -mt-16 p-6 pt-0 sm:-mt-20 sm:p-9 sm:pt-0 lg:mt-0 lg:w-[58%] lg:p-12">
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold">
                درباره استادکاران
              </span>
              <h1 className="mt-4 text-3xl/[1.5] font-black sm:text-5xl/[1.4]">{title}</h1>
              <p className="mt-3 text-xl/9 font-extrabold text-accent sm:text-2xl/10">
                {founderName}
                <span className="ms-3 text-sm font-semibold text-white/80 sm:text-base">مدیرعامل استادکاران</span>
              </p>
              <p className="mt-3 max-w-2xl text-base/8 font-medium text-white/90 sm:text-lg/9">
                {founderName}، مدیرعامل، بنیان‌گذار و مسئول فنی مجموعه استادکاران، با ۳۲ سال سابقه در تعمیر و نصب لوازم
                خانگی.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {["۳۲ سال سابقه", "مدرس فنی و حرفه‌ای", "کارشناس صدا و سیما"].map((label) => (
                  <li key={label} className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-bold sm:text-sm">
                    {label}
                  </li>
                ))}
              </ul>
            </div>
        </header>

        <div className="mx-auto mt-8 max-w-4xl space-y-10 sm:mt-10 sm:space-y-12">
          <section aria-labelledby="intro-heading">
            <h2 id="intro-heading" className="text-xl/9 font-extrabold text-primary sm:text-2xl/10">
              معرفی
            </h2>
            <p className="mt-2 text-sm/8 text-slate-700 sm:text-base/9">
              استادکاران مجموعه‌ای در {siteConfig.business.city} و {siteConfig.business.region} برای تعمیر و نصب لوازم خانگی
              ایرانی و خارجی است. {founderName}، مدیرعامل و بنیان‌گذار مجموعه و مسئول فنی آن، {siteConfig.business.experienceYears}{" "}
              سال است که در تعمیر و نصب لوازم خانگی فعالیت می‌کند.
            </p>
          </section>

          <section aria-labelledby="experience-heading">
            <h2 id="experience-heading" className="text-xl/9 font-extrabold text-primary sm:text-2xl/10">
              سابقه و تجربه کاری
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {credentials.map(({ icon: Icon, title: itemTitle, text }) => (
                <li key={itemTitle} className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent-strong">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-3 text-base/7 font-bold text-foreground">{itemTitle}</h3>
                  <p className="mt-1 text-sm/6 text-muted">{text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="responsibility-heading">
            <h2 id="responsibility-heading" className="text-xl/9 font-extrabold text-primary sm:text-2xl/10">
              مسئولیت فنی و رویکرد مجموعه
            </h2>
            <p className="mt-2 text-sm/8 text-slate-700 sm:text-base/9">
              مسئولیت فنی مجموعه استادکاران بر عهده {founderName} است. مجموعه دستگاه‌های ایرانی و خارجی را بررسی و تعمیر
              می‌کند و هزینه را پیش از شروع کار اعلام می‌کند.
            </p>
          </section>

          <section aria-labelledby="values-heading">
            <h2 id="values-heading" className="text-xl/9 font-extrabold text-primary sm:text-2xl/10">
              ارزش‌های کاری
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {values.map(({ icon: Icon, title: itemTitle, text }) => (
                <li key={itemTitle} className="rounded-2xl border border-border bg-background p-4 sm:p-5">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent-strong">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-3 text-base/7 font-bold text-foreground">{itemTitle}</h3>
                  <p className="mt-1 text-sm/6 text-muted">{text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="photos-heading">
            <h2 id="photos-heading" className="text-xl/9 font-extrabold text-primary sm:text-2xl/10">
              آلبوم عکس
            </h2>
            <FounderPhotoAlbum photos={founderPhotos} />
          </section>

          <section aria-labelledby="videos-heading">
            <h2 id="videos-heading" className="text-xl/9 font-extrabold text-primary sm:text-2xl/10">
              آلبوم ویدئو
            </h2>
            {founderVideos.length > 0 ? (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {founderVideos.map((video) => (
                  <li key={video.src} className="overflow-hidden rounded-2xl border border-border bg-background">
                    <video controls preload="none" poster={video.poster} className="aspect-video w-full bg-black">
                      <source src={video.src} />
                    </video>
                    <p className="p-3 text-sm/6 font-semibold text-foreground">{video.title}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-border p-6 text-center text-sm/7 text-muted">
                ویدئوها به‌زودی در این بخش قرار می‌گیرد.
              </p>
            )}
          </section>

          <section
            aria-labelledby="contact-heading"
            className="rounded-3xl border border-accent/40 bg-accent/[0.06] p-6 text-center sm:p-9"
          >
            <h2 id="contact-heading" className="text-xl/9 font-extrabold text-foreground sm:text-2xl/10">
              برای تعمیر دستگاه خود با ما در ارتباط باشید
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm/7 text-muted sm:text-base/8">
              مشکل دستگاه را تلفنی با ما در میان بگذارید یا درخواست تعمیر را ثبت کنید. هزینه پیش از تعمیر اعلام می‌شود.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <RepairRequestCta className="w-full sm:w-auto" />
              <PhoneCta variant="outline" className="w-full sm:w-auto" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
