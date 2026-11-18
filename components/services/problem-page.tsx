import Link from "next/link";
import { VerificationBadge } from "@/components/error-codes/verification-badge";
import { CheckCircleIcon } from "@/components/icons/ui-icons";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PhoneCta } from "@/components/ui/phone-cta";
import { RepairRequestCta } from "@/components/ui/repair-request-cta";
import { getSiblingApprovedProblems, problemPath } from "@/data/service-problems";
import { repairRequestHref, servicePath } from "@/data/services";
import type { ProblemCodeEntry } from "@/lib/error-codes/problem-codes";
import { siteConfig } from "@/lib/site";
import type { ProblemPage, Service } from "@/types/service";

const { business } = siteConfig;

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-xl/[1.7] font-extrabold text-primary sm:text-2xl/[1.7]">
      {children}
    </h2>
  );
}

function CodeList({ problem, entries }: { problem: ProblemPage; entries: readonly ProblemCodeEntry[] }) {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {entries.map(({ row, ref }) => (
        <li key={row.id} className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href={`/error-codes/${problem.serviceId}/${row.id}`}
              className="inline-flex min-h-8 items-center gap-1.5 text-base font-bold text-primary hover:text-accent-strong"
            >
              <span>{row.brand}</span>
              <span dir="ltr">{row.error_code}</span>
            </Link>
            <VerificationBadge level={row.verification_level === "verified" ? "verified" : "partially_verified"} />
          </div>
          <p className="mt-1 text-sm/7 font-semibold text-foreground">{row.title}</p>
          <p className="text-sm/7 text-muted">{row.meaning}</p>
          {ref.note && <p className="mt-1 text-sm/7 font-medium text-foreground">{ref.note}</p>}
        </li>
      ))}
    </ul>
  );
}

// Server-rendered template for /services/<service>/<problem>. All wording lives in data/service-problems.ts;
// error-code rows are passed in from the database layer.
export function ProblemPageView({
  problem,
  service,
  codes,
  isDraftPreview,
}: {
  problem: ProblemPage;
  service: Service;
  codes: readonly ProblemCodeEntry[];
  isDraftPreview: boolean;
}) {
  const requestHref = repairRequestHref(service);
  const siblings = getSiblingApprovedProblems(problem);
  const mainCodes = codes.filter((entry) => entry.ref.tier !== "needs-review");
  const reviewCodes = codes.filter((entry) => entry.ref.tier === "needs-review");

  return (
    <main className="flex-1">
      <div className="page-container py-6 sm:py-8">
        {isDraftPreview && (
          <p role="note" className="mb-4 rounded-2xl border border-cta/40 bg-cta/10 p-4 text-sm/7 font-bold text-foreground">
            پیش‌نویس: این صفحه هنوز توسط مسئول فنی تأیید نشده است و فقط در حالت توسعه دیده می‌شود.
          </p>
        )}
        <Breadcrumbs
          items={[
            { label: "خانه", href: "/" },
            { label: "خدمات", href: "/services" },
            { label: service.navTitle, href: servicePath(service) },
            { label: problem.h1 },
          ]}
        />

        <header className="mt-4 rounded-3xl border border-border bg-surface p-5 sm:p-8 lg:p-10">
          <h1 className="text-[1.75rem]/[1.6] font-extrabold text-primary sm:text-4xl/[1.5]">{problem.h1}</h1>
          {problem.intro.map((paragraph) => (
            <p key={paragraph} className="mt-3 max-w-3xl text-sm/8 text-muted sm:text-base/8">
              {paragraph}
            </p>
          ))}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <PhoneCta variant="block" className="sm:w-auto sm:min-w-56" />
            <RepairRequestCta href={requestHref} />
          </div>
          <p className="mt-3 text-sm/7 text-muted">
            پاسخ‌گویی {business.hours}، همراه با {business.duty}؛ هزینه پیش از تعمیر اعلام می‌شود.
          </p>
        </header>

        <section aria-labelledby="symptoms-heading" className="mt-10">
          <SectionHeading id="symptoms-heading">نشانه‌های این مشکل</SectionHeading>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {problem.symptoms.map((symptom) => (
              <li key={symptom} className="rounded-2xl border border-border bg-surface p-4 text-sm/7 text-foreground">
                {symptom}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="causes-heading" className="mt-10">
          <SectionHeading id="causes-heading">علت‌های رایج</SectionHeading>
          <p className="mt-1 text-sm/7 text-muted">علت دقیق پس از بررسی دستگاه مشخص می‌شود؛ موارد زیر فقط علت‌های رایج‌اند.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {problem.causes.map((cause) => (
              <li key={cause.part} className="rounded-2xl border border-border bg-surface p-4">
                <h3 className="text-base/7 font-bold text-foreground">{cause.part}</h3>
                <p className="mt-1 text-sm/7 text-muted">{cause.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="checks-heading" className="mt-10">
          <SectionHeading id="checks-heading">پیش از تماس بررسی کنید</SectionHeading>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ul className="space-y-2.5 rounded-2xl border border-border bg-surface p-5 text-sm/7 text-foreground">
              {problem.safeChecks.map((check) => (
                <li key={check} className="flex items-start gap-2.5">
                  <CheckCircleIcon className="mt-1 size-4 shrink-0 text-accent-strong" />
                  {check}
                </li>
              ))}
            </ul>
            {problem.safetyNote && (
              <p className="rounded-2xl border border-cta/40 bg-cta/10 p-5 text-sm/7 font-medium text-foreground">
                <strong className="font-bold">نکته ایمنی: </strong>
                {problem.safetyNote}
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="call-heading" className="mt-10">
          <SectionHeading id="call-heading">چه زمانی با تعمیرکار تماس بگیریم؟</SectionHeading>
          <ul className="mt-4 space-y-2 text-sm/7 text-foreground">
            {problem.callWhen.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircleIcon className="mt-1 size-4 shrink-0 text-accent-strong" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {mainCodes.length > 0 && (
          <section aria-labelledby="codes-heading" className="mt-10">
            <SectionHeading id="codes-heading">کدهای خطای مرتبط</SectionHeading>
            <p className="mt-1 text-sm/7 text-muted">
              معنی هر کد به برند و مدل دستگاه بستگی دارد؛ کد را با دفترچه دستگاه خودتان تطبیق دهید.
            </p>
            <CodeList problem={problem} entries={mainCodes} />
          </section>
        )}

        {reviewCodes.length > 0 && (
          <section aria-labelledby="review-codes-heading" className="mt-10">
            <SectionHeading id="review-codes-heading">کدهای نیازمند بررسی</SectionHeading>
            <p className="mt-1 text-sm/7 text-muted">
              مدل یا منبع این کدها هنوز کاملاً تأیید نشده است؛ آن‌ها را معنی قطعی ندانید و با دفترچه دستگاه خودتان تطبیق دهید.
            </p>
            <CodeList problem={problem} entries={reviewCodes} />
          </section>
        )}

        <section aria-labelledby="faq-heading" className="mt-10">
          <SectionHeading id="faq-heading">پرسش‌های رایج</SectionHeading>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {problem.faqs.map((faq) => (
              <li key={faq.question} className="rounded-2xl border border-border bg-surface p-4">
                <h3 className="text-base/7 font-bold text-foreground">{faq.question}</h3>
                <p className="mt-1 text-sm/7 text-muted">{faq.answer}</p>
              </li>
            ))}
          </ul>
        </section>

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
            <Link href={servicePath(service)} className="font-semibold text-accent-strong underline-offset-4 hover:underline">
              {service.h1}
            </Link>
          </p>
        </section>

        {siblings.length > 0 && (
          <nav aria-labelledby="siblings-heading" className="mt-10 mb-4">
            <h2 id="siblings-heading" className="text-base/7 font-bold text-foreground">
              مشکلات مرتبط
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {siblings.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={problemPath(item)}
                    className="inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold text-primary transition-colors hover:border-accent-strong hover:bg-accent/5"
                  >
                    {item.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </main>
  );
}
