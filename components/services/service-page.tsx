import Image from "next/image";
import Link from "next/link";
import { CheckCircleIcon } from "@/components/icons/ui-icons";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PhoneCta } from "@/components/ui/phone-cta";
import { RepairRequestCta } from "@/components/ui/repair-request-cta";
import { appliances } from "@/data/appliances";
import { getErrorCodeCategory } from "@/data/error-codes/categories";
import { getApprovedProblemForCard, problemPath } from "@/data/service-problems";
import { repairRequestHref, servicePath, services } from "@/data/services";
import { getServiceErrorCodeLinks } from "@/lib/error-codes/related";
import { siteConfig } from "@/lib/site";
import type { Service } from "@/types/service";

const { business } = siteConfig;

// One shared technician photo (also the homepage repair-process background). Wide, light background kept as is.
const technicianPhoto = {
  src: "/images/sections/repair-process-background.webp",
  alt: "تکنسین استادکاران با جعبه ابزار در حال بررسی دستگاه در محیط خانه",
} as const;

// The repair process is the same for every appliance: it restates the site's confirmed process and warranty facts.
const processSteps = [
  { title: "مشکل را بگویید", description: "با ما تماس بگیرید یا درخواست آنلاین ثبت کنید و نوع دستگاه و مشکل را توضیح دهید." },
  { title: "عیب‌یابی", description: "دستگاه بررسی می‌شود تا علت خرابی و قطعات نیازمند تعمیر مشخص شود." },
  { title: "اعلام هزینه", description: "پیش‌فاکتور ارائه می‌شود و هزینه پیش از انجام تعمیر اعلام می‌شود." },
  { title: "تعمیر و ضمانت", description: "پس از تأیید شما تعمیر انجام می‌شود و ضمانت کتبی ۶ ماهه دریافت می‌کنید." },
] as const;

// Confirmed facts only, kept short next to the primary actions.
const keyFacts = [
  business.warranty,
  "اعلام هزینه پیش از تعمیر",
  "برندهای ایرانی و خارجی",
  `${business.experienceYears} سال سابقه`,
] as const;

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-xl/[1.7] font-extrabold text-primary sm:text-2xl/[1.7]">
      {children}
    </h2>
  );
}

// Server-rendered template shared by all /services/<slug> pages. Everything specific lives in data/services.ts.
export async function ServicePage({ service }: { service: Service }) {
  const appliance = appliances.find((item) => item.id === service.id);
  const requestHref = repairRequestHref(service);
  const otherServices = services.filter((item) => item.id !== service.id);
  // Link to the matching error-code category only when that category exists.
  const errorCategory = getErrorCodeCategory(service.id);
  const errorCodes = errorCategory ? await getServiceErrorCodeLinks(errorCategory.id) : [];
  // Device photos are 4:3, so they keep their full frame on mobile; the technician photo stays 3:2.
  const headerPhoto = service.image ?? technicianPhoto;
  const isDevicePhoto = service.image !== undefined;

  return (
    <main className="flex-1">
      <div className="page-container py-6 sm:py-8">
        <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "خدمات", href: "/services" }, { label: service.navTitle }]} />

        {/* Two columns from lg: text and actions first (RTL start), photo beside them. Stacked on mobile, actions first. */}
        <header className="mt-4 grid overflow-hidden rounded-3xl border border-border bg-surface lg:grid-cols-2">
          <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
            <h1 className="text-[1.75rem]/[1.6] font-extrabold text-primary sm:text-4xl/[1.5]">{service.h1}</h1>
            {service.intro.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm/8 text-muted sm:text-base/8">
                {paragraph}
              </p>
            ))}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <PhoneCta variant="block" className="sm:w-auto sm:min-w-56" />
              <RepairRequestCta href={requestHref} />
            </div>
            <p className="mt-3 text-sm/7 text-muted">
              <a href={siteConfig.contact.phone.href} dir="ltr" className="inline-block text-base font-extrabold text-primary">
                {siteConfig.contact.phone.display}
              </a>
              <span className="block">
                پاسخ‌گویی {business.hours}، همراه با {business.duty}
              </span>
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm/6 text-foreground">
              {keyFacts.map((fact) => (
                <li key={fact} className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-accent-strong" />
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`relative sm:max-h-[26rem] lg:aspect-auto lg:max-h-none lg:min-h-[26rem] ${isDevicePhoto ? "aspect-[4/3]" : "aspect-[3/2]"}`}
          >
            <Image
              src={headerPhoto.src}
              alt={headerPhoto.alt}
              fill
              sizes="(min-width: 1280px) 608px, (min-width: 1024px) 50vw, 100vw"
              loading="eager"
              fetchPriority="high"
              className={`object-cover ${isDevicePhoto ? "object-center" : "object-[88%_center]"}`}
            />
          </div>
        </header>

        {/* Common problems */}
        <section aria-labelledby="problems-heading" className="mt-10">
          <SectionHeading id="problems-heading">{`مشکلات رایج ${appliance?.title ?? service.navTitle}`}</SectionHeading>
          <p className="mt-1 text-sm/7 text-muted">
            علت دقیق هر مشکل پس از بررسی دستگاه مشخص می‌شود؛ موارد زیر فقط علت‌های رایج‌اند.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {service.problems.map((problem) => {
              // Only approved problem pages are linked; drafts never appear here.
              const detail = getApprovedProblemForCard(service.id, problem.title);
              return (
                <li key={problem.title} className="rounded-2xl border border-border bg-surface p-4">
                  <h3 className="text-base/7 font-bold text-foreground">{problem.title}</h3>
                  <p className="mt-1 text-sm/7 text-muted">{problem.description}</p>
                  {detail && (
                    <Link
                      href={problemPath(detail)}
                      className="mt-2 inline-flex min-h-8 items-center text-sm font-semibold text-accent-strong underline-offset-4 hover:underline"
                    >
                      علت‌ها و بررسی اولیه
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* What to check before calling */}
        <section aria-labelledby="before-heading" className="mt-10">
          <SectionHeading id="before-heading">پیش از تماس بررسی کنید</SectionHeading>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ul className="space-y-2.5 rounded-2xl border border-border bg-surface p-5 text-sm/7 text-foreground">
              {service.beforeCalling.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <CheckCircleIcon className="mt-1 size-4 shrink-0 text-accent-strong" />
                  {tip}
                </li>
              ))}
            </ul>
            {service.safetyNote && (
              <p className="rounded-2xl border border-cta/40 bg-cta/10 p-5 text-sm/7 font-medium text-foreground">
                <strong className="font-bold">نکته ایمنی: </strong>
                {service.safetyNote}
              </p>
            )}
          </div>
          {errorCategory && (
            <p className="mt-4 text-sm/7 text-muted">
              اگر دستگاه کد یا پیام خطا نشان می‌دهد، {" "}
              <Link
                href={`/error-codes/${errorCategory.id}`}
                className="font-semibold text-accent-strong underline-offset-4 hover:underline"
              >
                راهنمای کدهای خطای {errorCategory.title}
              </Link>{" "}
              را ببینید.
            </p>
          )}
          {errorCategory && errorCodes.length > 0 && (
            <ul aria-label="نمونه کدهای خطا" className="mt-3 flex flex-wrap gap-2">
              {errorCodes.map((code) => (
                <li key={code.id}>
                  <Link
                    href={`/error-codes/${errorCategory.id}/${code.id}`}
                    title={code.title}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 text-sm text-primary transition-colors hover:border-accent-strong hover:bg-accent/5"
                  >
                    <span className="font-semibold">{code.brand}</span>
                    <span dir="ltr" className="font-bold">
                      {code.error_code}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Process */}
        <section aria-labelledby="process-heading" className="mt-10">
          <SectionHeading id="process-heading">روند ثبت درخواست و تعمیر</SectionHeading>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-border bg-surface p-4">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent-strong">
                  {(index + 1).toLocaleString("fa-IR")}
                </span>
                <h3 className="mt-3 text-base/7 font-bold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm/7 text-muted">{step.description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-2xl border border-border bg-surface p-4 text-sm/7 text-muted">
            <h3 className="text-base/7 font-bold text-foreground">خدمات در محل و پاسخ‌گویی</h3>
            <p className="mt-1">
              تکنسین استادکاران برای عیب‌یابی و تعمیر به محل شما در {business.city} می‌آید. پاسخ‌گویی {business.hours} است و{" "}
              {business.duty} هم داریم؛ با {business.experienceYears} سال سابقه، هزینه پیش از تعمیر اعلام می‌شود و{" "}
              تعمیر {business.warranty} دارد.
            </p>
            <p className="mt-1">
              منطقه خدمات‌دهی ما {business.region} است؛ برای شهرها و روستاهای خارج از {business.city}، پیش از ثبت درخواست
              تماس بگیرید.
            </p>
          </div>
        </section>

        {/* Device-specific FAQ */}
        <section aria-labelledby="faq-heading" className="mt-10">
          <SectionHeading id="faq-heading">{`پرسش‌های رایج ${appliance?.title ?? service.navTitle}`}</SectionHeading>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {service.faqs.map((faq) => (
              <li key={faq.question} className="rounded-2xl border border-border bg-surface p-4">
                <h3 className="text-base/7 font-bold text-foreground">{faq.question}</h3>
                <p className="mt-1 text-sm/7 text-muted">{faq.answer}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing call to action: same actions as the header, so nobody has to scroll back up. */}
        <section
          aria-labelledby="final-cta-heading"
          className="mt-10 rounded-3xl border border-accent/40 bg-accent/[0.06] p-5 sm:p-7"
        >
          <h2 id="final-cta-heading" className="text-lg/8 font-bold text-foreground">
            مشکل دستگاهتان را با ما در میان بگذارید
          </h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <PhoneCta variant="block" className="sm:w-auto sm:min-w-56" />
            <RepairRequestCta href={requestHref} />
          </div>
          <p className="mt-3 text-sm/7 text-muted">
            <a href={siteConfig.contact.phone.href} dir="ltr" className="inline-block text-base font-extrabold text-primary">
              {siteConfig.contact.phone.display}
            </a>
            <span className="block">
              پاسخ‌گویی {business.hours}، همراه با {business.duty}
            </span>
          </p>
        </section>

        {/* Internal links to the other services */}
        <nav aria-labelledby="related-heading" className="mt-10 mb-4">
          <h2 id="related-heading" className="text-base/7 font-bold text-foreground">
            سایر خدمات تعمیر
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {otherServices.map((item) => (
              <li key={item.id}>
                <Link
                  href={servicePath(item)}
                  className="inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold text-primary transition-colors hover:border-accent-strong hover:bg-accent/5"
                >
                  {item.navTitle}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
